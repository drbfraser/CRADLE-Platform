from email import message
import json
from pprint import pp

import api.util as util
import data
import data.crud as crud
import data.marshal as marshal
import service.serialize as serialize
from api.decorator import roles_required
from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort
from models import ContentTypeEnum, FormClassification, FormTemplate, Question, RoleEnum
from utils import get_current_time, pprint
import utils
from validation import formTemplates
from werkzeug.datastructures import FileStorage


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
        req = {}

        # provide file upload method from web
        if "file" in request.files:
            file: FileStorage = request.files["file"]

            if file.content_type not in ContentTypeEnum.listValues():
                abort(400, message="File Type not supported")

            file_str = str(file.read(), "utf-8")
            if file.content_type == ContentTypeEnum.JSON.value:
                try:
                    req = json.loads(file_str)
                except json.JSONDecodeError:
                    abort(400, message="File content is not valid json-format")

            elif file.content_type == ContentTypeEnum.CSV.value:
                try:
                    req = util.getFormTemplateDictFromCSV(file_str)
                except RuntimeError as err:
                    abort(400, message=err.args[0])
                except TypeError as err:
                    pprint(err)
                    abort(400, message=err.args[0])
                except:
                    abort(
                        400, message="Something went wrong while parsing the CSV file."
                    )
        else:
            req = request.get_json(force=True)

        if len(req) == 0:
            abort(400, message="Request body is empty")

        if req.get("id") is not None:
            if crud.read(FormTemplate, id=req["id"]):
                abort(409, message="Form template already exists")

        error_message = formTemplates.validate_template(req)
        if error_message:
            abort(404, message=error_message)

        classification = crud.read(
            FormClassification, name=req["classification"].get("name")
        )

        if classification is not None:
            req["classification"]["id"] = classification.id

            if crud.read(
                FormTemplate,
                formClassificationId=classification.id,
                version=req["version"],
            ):
                abort(
                    409,
                    message="Form template with the same version already exists - change the version to upload",
                )

        util.assign_form_or_template_ids(FormTemplate, req)

        formTemplate = marshal.unmarshal(FormTemplate, req)

        crud.create(formTemplate, refresh=True)

        return marshal.marshal(formTemplate, shallow=True), 201

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/form-templates-get.yml",
        methods=["GET"],
        endpoint="form_templates",
    )
    def get():

        params = util.get_query_params(request)

        filters: dict = {}

        if (
            params.get("include_archived") is None
            or params.get("include_archived") == 0
        ):
            filters["archived"] = 0

        form_templates = crud.read_all(FormTemplate, **filters)

        return [marshal.marshal(f, shallow=True) for f in form_templates]


# /api/forms/templates/<string:form_template_id>/versions
class SingleTemplateVersion(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-form-template-version-get.yml",
        methods=["GET"],
        endpoint="single_form_template_version",
    )
    def get(form_template_id: str):
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form with id {form_template_id}")

        lang_list = crud.read_form_template_versions(form_template)

        return {"lang_versions": lang_list}


# /api/forms/templates/<string:form_template_id>
class SingleFormTemplate(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-form-template-get.yml",
        methods=["GET"],
        endpoint="single_form_template",
    )
    def get(form_template_id: str):
        params = util.get_query_params(request)
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form with id {form_template_id}")

        version = params.get("lang")
        if version == None:
            # admin user get template of full verions
            return marshal.marshal(
                form_template, shallow=False, if_include_versions=True
            )

        available_versions = crud.read_form_template_versions(
            form_template, refresh=True
        )
        if not version in available_versions:
            abort(
                404,
                message=f"Template(id={form_template_id}) doesn't have language version = {version}",
            )

        return marshal.marshal_template_to_single_version(form_template, version)

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-form-template-put.yml",
        methods=["PUT"],
        endpoint="single_form_template",
    )
    def put(form_template_id: str):

        form_template = crud.read(FormTemplate, id=form_template_id)

        if not form_template:
            abort(404, message=f"No form template with id {form_template_id}")

        req = request.get_json()
        if req.get("archived") is not None:
            form_template.archived = req.get("archived")
            data.db_session.commit()
            data.db_session.refresh(form_template)

        return marshal.marshal(form_template, True), 201


# /api/forms/templates/blank/<string:form_template_id>
class BlankFormTemplate(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/blank-form-template-get.yml",
        methods=["GET"],
        endpoint="blank_form_template",
    )
    def get(form_template_id: str):
        params = util.get_query_params(request)
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form with id {form_template_id}")

        version = params.get("lang")
        if version == None:
            # admin user get template of full verions
            blank_template = marshal.marshal(
                form_template, shallow=False, if_include_versions=True
            )
            blank_template = serialize.serialize_blank_form_template(blank_template)
            return blank_template

        available_versions = crud.read_form_template_versions(
            form_template, refresh=True
        )
        if not version in available_versions:
            abort(
                404,
                message=f"Template(id={form_template_id}) doesn't have language version = {version}",
            )

        blank_template = marshal.marshal_template_to_single_version(
            form_template, version
        )
        blank_template = serialize.serialize_blank_form_template(blank_template)

        return blank_template
