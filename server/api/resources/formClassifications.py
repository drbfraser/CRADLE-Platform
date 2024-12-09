import json
import logging

from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort
from werkzeug.datastructures import FileStorage

import data
from api import util
from api.decorator import roles_required
from common import commonUtil
from data import crud, marshal
from enums import ContentTypeEnum, RoleEnum
from models import FormClassification, FormTemplate
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
        request_json = {}

        # provide file upload method from web
        if "file" in request.files:
            file: FileStorage = request.files["file"]

            if file.content_type not in ContentTypeEnum.listValues():
                abort(400, message="File Type not supported")

            file_str = str(file.read(), "utf-8")
            if file.content_type == ContentTypeEnum.JSON.value:
                try:
                    request_json = json.loads(file_str)
                except json.JSONDecodeError as err:
                    LOGGER.error(err)
                    abort(400, message="File content is not valid json-format")

            elif file.content_type == ContentTypeEnum.CSV.value:
                try:
                    request_json = util.getFormTemplateDictFromCSV(file_str)
                except RuntimeError as err:
                    LOGGER.error(err)
                    abort(400, message=err.args[0])
                except TypeError as err:
                    LOGGER.error(err)
                    abort(400, message=err.args[0])
                except Exception as err:
                    LOGGER.error(err)
                    abort(
                        400,
                        message="Something went wrong while parsing the CSV file.",
                    )
        else:
            request_json = request.get_json(force=True)

        # Note: This validation logic is left out of the Pydantic validation system
        # because it relies on the database, which the unit tests do not have access to (Issue #689)
        if len(request_json) == 0:
            abort(400, message="Request body is empty")

        if request_json.get("id") is not None:
            if crud.read(FormClassification, id=request_json["id"]):
                abort(409, message="Form classification already exists")

        try:
            form_classification_pydantic_model = FormClassificationValidator.validate(
                request_json,
            )
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        new_form_classification = form_classification_pydantic_model.model_dump()
        new_form_classification = commonUtil.filterNestedAttributeWithValueNone(
            new_form_classification,
        )

        if new_form_classification.get("name") is not None:
            if crud.read(FormClassification, id=new_form_classification["name"]):
                abort(
                    409,
                    message="Form classification with the same name already exists",
                )

        util.assign_form_or_template_ids(FormClassification, new_form_classification)

        formClassification = marshal.unmarshal(
            FormClassification,
            new_form_classification,
        )

        crud.create(formClassification, refresh=True)

        return marshal.marshal(formClassification, shallow=True), 201

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/form-classifications-get.yml",
        methods=["GET"],
        endpoint="form_classifications",
    )
    def get():
        form_classifications = crud.read_all(FormClassification)

        return [marshal.marshal(f, shallow=True) for f in form_classifications], 200


# /api/forms/classifications/<string:form_classification_id>
class SingleFormClassification(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-form-classification-get.yml",
        methods=["GET"],
        endpoint="single_form_classification",
    )
    def get(form_classification_id: str):
        form_classification = crud.read(FormClassification, id=form_classification_id)

        if not form_classification:
            abort(
                400,
                message=f"No form classification with id {form_classification_id}",
            )

        return marshal.marshal(form_classification), 200

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-form-classification-put.yml",
        methods=["PUT"],
        endpoint="single_form_classification",
    )
    def put(form_classification_id: str):
        form_classification = crud.read(FormClassification, id=form_classification_id)

        if not form_classification:
            abort(
                400,
                message=f"No form classification with id {form_classification_id}",
            )

        req = request.get_json()
        if req.get("name") is not None:
            form_classification.name = req.get("name")
            data.db_session.commit()
            data.db_session.refresh(form_classification)

        return marshal.marshal(form_classification, True), 201


# /api/forms/classifications/summary
class FormClassificationSummary(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/form-classification-summary-get.yml",
        methods=["GET"],
        endpoint="form_classification_summary",
    )
    def get():
        form_classifications = crud.read_all(FormClassification)
        result_templates = []

        for form_classification in form_classifications:
            possible_templates = crud.find(
                FormTemplate,
                FormTemplate.formClassificationId == form_classification.id,
            )

            if len(possible_templates) == 0:
                continue

            result_template = None
            for possible_template in possible_templates:
                if (
                    result_template is None
                    or possible_template.dateCreated > result_template.dateCreated
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
    @jwt_required()
    @swag_from(
        "../../specifications/form-classification-templates-get.yml",
        methods=["GET"],
        endpoint="form_classification_templates",
    )
    def get(form_classification_id: str):
        form_templates = crud.read_all(
            FormTemplate,
            formClassificationId=form_classification_id,
        )
        return [marshal.marshal(f, shallow=True) for f in form_templates], 200
