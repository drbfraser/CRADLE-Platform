import json

from flasgger import swag_from
from flask import make_response, request
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
from service import serialize
from validation.formTemplates import FormTemplateValidator
from validation.validation_exception import ValidationExceptionError


# /api/forms/templates
class Root(Resource):
    @staticmethod
    @roles_required([RoleEnum.ADMIN])
    @swag_from(
        "../../specifications/form-templates-post.yml",
        methods=["POST"],
        endpoint="form_templates",
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
                except json.JSONDecodeError:
                    abort(400, message="File content is not valid json-format")
                    return None

            elif file.content_type == ContentTypeEnum.CSV.value:
                try:
                    request_body = util.getFormTemplateDictFromCSV(file_str)
                except RuntimeError as err:
                    abort(400, message=err.args[0])
                    return None
                except TypeError as err:
                    abort(400, message=err.args[0])
                    return None
                except Exception:
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
            if crud.read(FormTemplateOrm, id=request_body["id"]):
                abort(409, message="Form template already exists")
                return None

        try:
            form_template_pydantic_model = FormTemplateValidator.validate(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))
            return None

        new_form_template = form_template_pydantic_model.model_dump()
        new_form_template = commonUtil.filterNestedAttributeWithValueNone(
            new_form_template,
        )

        classification = crud.read(
            FormClassificationOrm,
            name=new_form_template["classification"].get("name"),
        )

        if classification is not None:
            if crud.read(
                FormTemplateOrm,
                form_classification_id=classification.id,
                version=new_form_template["version"],
            ):
                abort(
                    409,
                    message="Form template with the same version already exists - change the version to upload",
                )

            del new_form_template["classification"]

            new_form_template["form_classification_id"] = classification.id

            previous_template = crud.read(
                FormTemplateOrm,
                form_classification_id=classification.id,
                archived=False,
            )

            if previous_template is not None:
                previous_template.archived = True
                data.db_session.commit()

        util.assign_form_or_template_ids(FormTemplateOrm, new_form_template)

        form_template = marshal.unmarshal(FormTemplateOrm, new_form_template)

        crud.create(form_template, refresh=True)

        return marshal.marshal(form_template, shallow=True), 201

    @staticmethod
    @swag_from(
        "../../specifications/form-templates-get.yml",
        methods=["GET"],
        endpoint="form_templates",
    )
    def get():
        params = api_utils.get_query_params()

        filters: dict = {}

        if (
            params.get("include_archived") is None
            or params.get("include_archived") == "false"
        ):
            filters["archived"] = 0

        form_templates = crud.read_all(FormTemplateOrm, **filters)

        return [marshal.marshal(f, shallow=True) for f in form_templates]


# /api/forms/templates/<string:form_template_id>/versions
class TemplateVersion(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/single-form-template-version-get.yml",
        methods=["GET"],
        endpoint="single_form_template_version",
    )
    def get(form_template_id: str):
        form_template = crud.read(FormTemplateOrm, id=form_template_id)
        if form_template is None:
            abort(404, message=f"No form with id {form_template_id}")
            return None

        lang_list = crud.read_form_template_versions(form_template)

        return {"lang_versions": lang_list}


# /api/forms/templates/<string:form_template_id>/versions/<string:version>/csv
class TemplateVersionCsv(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/single-form-template-get-csv.yml",
        methods=["GET"],
        endpoint="single_form_template_csv",
    )
    def get(form_template_id: str, version: str):
        filters: dict = {
            "id": form_template_id,
            "version": version,
        }

        form_template = crud.read(
            FormTemplateOrm,
            **filters,
        )

        if not form_template:
            abort(404, message=f"No form with id {form_template_id}")

        csv: str = util.getCsvFromFormTemplate(form_template)

        response = make_response(csv)
        response.headers["Content-Disposition"] = (
            "attachment; filename=form_template.csv"
        )
        response.headers["Content-Type"] = "text/csv"
        return response


# /api/forms/templates/<string:form_template_id>
class FormTemplateResource(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/single-form-template-get.yml",
        methods=["GET"],
        endpoint="single_form_template",
    )
    def get(form_template_id: str):
        params = api_utils.get_query_params()
        form_template = crud.read(FormTemplateOrm, id=form_template_id)
        if form_template is None:
            abort(404, message=f"No form with id {form_template_id}")
            return None

        version = params.get("lang")
        if version is None:
            # admin user get template of full verions
            return marshal.marshal(
                form_template,
                shallow=False,
                if_include_versions=True,
            )

        available_versions = crud.read_form_template_versions(
            form_template,
            refresh=True,
        )
        if version not in available_versions:
            abort(
                404,
                message=f"Template(id={form_template_id}) doesn't have language version = {version}",
            )
            return None

        return marshal.marshal_template_to_single_version(form_template, version)

    @staticmethod
    @swag_from(
        "../../specifications/single-form-template-put.yml",
        methods=["PUT"],
        endpoint="single_form_template",
    )
    def put(form_template_id: str):
        form_template = crud.read(FormTemplateOrm, id=form_template_id)

        if not form_template:
            abort(404, message=f"No form template with id {form_template_id}")
            return None

        request_body = api_utils.get_request_body()
        if request_body.get("archived") is not None:
            form_template.archived = request_body.get("archived")
            data.db_session.commit()
            data.db_session.refresh(form_template)

        return marshal.marshal(form_template, True), 201


# /api/forms/templates/blank/<string:form_template_id>
class BlankFormTemplate(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/blank-form-template-get.yml",
        methods=["GET"],
        endpoint="blank_form_template",
    )
    def get(form_template_id: str):
        params = api_utils.get_query_params()
        form_template = crud.read(FormTemplateOrm, id=form_template_id)
        if form_template is None:
            abort(404, message=f"No form with id {form_template_id}")
            return None

        version = params.get("lang")
        if version is None:
            # admin user get template of full versions
            blank_template = marshal.marshal(
                form_template,
                shallow=False,
                if_include_versions=True,
            )
            blank_template = serialize.serialize_blank_form_template(blank_template)
            return blank_template

        available_versions = crud.read_form_template_versions(
            form_template,
            refresh=True,
        )
        if version not in available_versions:
            abort(
                404,
                message=f"Template(id={form_template_id}) doesn't have language version = {version}",
            )
            return None

        blank_template = marshal.marshal_template_to_single_version(
            form_template,
            version,
        )
        blank_template = serialize.serialize_blank_form_template(blank_template)

        return blank_template
