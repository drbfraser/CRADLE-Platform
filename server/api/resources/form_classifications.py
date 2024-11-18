import json
import logging

from flasgger import swag_from
from flask import request
from flask_restful import Resource, abort
from humps import decamelize
from werkzeug.datastructures import FileStorage

import data
from api import util
from api.decorator import roles_required
from common import api_utils, commonUtil
from data import crud, marshal
from enums import ContentTypeEnum, RoleEnum
from models import FormClassificationOrm, FormTemplateOrm
from validation.formClassifications import FormClassificationValidator
from validation.validation_exception import ValidationExceptionError

LOGGER = logging.getLogger(__name__)


# /api/forms/classifications
class Root(Resource):
    @staticmethod
    @roles_required([RoleEnum.ADMIN])
    @swag_from(
        "../../specifications/form-classifications-post.yml",
        methods=["POST"],
        endpoint="form_classifications",
    )
    def post():
        request_body = {}

        # provide file upload method from web
        if "file" in request.files:
            file: FileStorage = request.files["file"]

            if file.content_type not in ContentTypeEnum.listValues():
                abort(400, message="File Type not supported")
                return None

            file_str = str(file.read(), "utf-8")
            if file.content_type == ContentTypeEnum.JSON.value:
                try:
                    request_body = json.loads(file_str)
                except json.JSONDecodeError as err:
                    LOGGER.error(err)
                    abort(400, message="File content is not valid json-format")

            elif file.content_type == ContentTypeEnum.CSV.value:
                try:
                    request_body = util.getFormTemplateDictFromCSV(file_str)
                except RuntimeError as err:
                    LOGGER.error(err)
                    abort(400, message=err.args[0])
                    return None
                except TypeError as err:
                    LOGGER.error(err)
                    abort(400, message=err.args[0])
                    return None
                except Exception as err:
                    LOGGER.error(err)
                    abort(
                        400,
                        message="Something went wrong while parsing the CSV file.",
                    )
                    return None
        else:
            request_body = request.get_json(force=True)

        if len(request_body) == 0:
            abort(400, message="Request body is empty")
            return None

        # Convert keys to snake case.
        request_body = decamelize(request_body)

        if request_body.get("id") is not None:
            if crud.read(FormClassificationOrm, id=request_body["id"]):
                abort(409, message="Form classification already exists")

        try:
            form_classification_pydantic_model = FormClassificationValidator.validate(
                request_body,
            )
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        new_form_classification = form_classification_pydantic_model.model_dump()
        new_form_classification = commonUtil.filterNestedAttributeWithValueNone(
            new_form_classification,
        )

        if new_form_classification.get("name") is not None:
            if crud.read(FormClassificationOrm, id=new_form_classification["name"]):
                abort(
                    409,
                    message="Form classification with the same name already exists",
                )

        util.assign_form_or_template_ids(FormClassificationOrm, new_form_classification)

        form_classification = marshal.unmarshal(
            FormClassificationOrm,
            new_form_classification,
        )

        crud.create(form_classification, refresh=True)

        return marshal.marshal(form_classification, shallow=True), 201

    @staticmethod
    @swag_from(
        "../../specifications/form-classifications-get.yml",
        methods=["GET"],
        endpoint="form_classifications",
    )
    def get():
        form_classifications = crud.read_all(FormClassificationOrm)

        return [marshal.marshal(f, shallow=True) for f in form_classifications], 200


# /api/forms/classifications/<string:form_classification_id>
class SingleFormClassification(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/single-form-classification-get.yml",
        methods=["GET"],
        endpoint="single_form_classification",
    )
    def get(form_classification_id: str):
        form_classification = crud.read(
            FormClassificationOrm, id=form_classification_id
        )

        if not form_classification:
            abort(
                400,
                message=f"No form classification with id {form_classification_id}",
            )

        return marshal.marshal(form_classification), 200

    @staticmethod
    @swag_from(
        "../../specifications/single-form-classification-put.yml",
        methods=["PUT"],
        endpoint="single_form_classification",
    )
    def put(form_classification_id: str):
        form_classification = crud.read(
            FormClassificationOrm, id=form_classification_id
        )

        if form_classification is None:
            abort(
                400,
                message=f"No form classification with id {form_classification_id}",
            )
            return None

        request_body = api_utils.get_request_body()
        if request_body.get("name") is not None:
            form_classification.name = request_body.get("name")
            data.db_session.commit()
            data.db_session.refresh(form_classification)

        return marshal.marshal(form_classification, True), 201


# /api/forms/classifications/summary
class FormClassificationSummary(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/form-classification-summary-get.yml",
        methods=["GET"],
        endpoint="form_classification_summary",
    )
    def get():
        form_classifications = crud.read_all(FormClassificationOrm)
        result_templates = []

        for form_classification in form_classifications:
            possible_templates = crud.find(
                FormTemplateOrm,
                FormTemplateOrm.form_classification_id == form_classification.id,
            )

            if len(possible_templates) == 0:
                continue

            result_template = None
            for possible_template in possible_templates:
                if (
                    result_template is None
                    or possible_template.date_created > result_template.date_created
                ):
                    result_template = possible_template

            if result_template is not None:
                result_templates.append(result_template)

        return [
            marshal.marshal(f, shallow=False, if_include_versions=True)
            for f in result_templates
        ], 200


# /api/forms/classifications/<string:form_classification_name>/templates
class FormClassificationTemplates(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/form-classification-templates-get.yml",
        methods=["GET"],
        endpoint="form_classification_templates",
    )
    def get(form_classification_id: str):
        form_templates = crud.read_all(
            FormTemplateOrm,
            form_classification_id=form_classification_id,
        )
        return [marshal.marshal(f, shallow=True) for f in form_templates], 200
