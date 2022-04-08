from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import data
import data.crud as crud
import data.marshal as marshal
import api.util as util
import service.serialize as serialize
from models import FormTemplate, Question, RoleEnum
import service.serialize as serialize
from service import questionTree
from validation import formTemplates
from utils import get_current_time
from api.decorator import roles_required


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
        req = request.get_json(force=True)

        error_message = formTemplates.validate_template(req)
        if error_message:
            abort(404, message=error_message)

        questions = split_question(req)
        error_message = formTemplates.validate_questions(questions)
        if error_message:
            abort(404, message=error_message)

        question_ids = [question["id"] for question in questions]
        if crud.check_any_question_exist(question_ids):
            return f"There are questions already existed in database"

        formTemplate = marshal.unmarshal(FormTemplate, req)

        crud.create(formTemplate, refresh=True)

        for q in questions:
            q["formTemplateId"] = formTemplate.id

        questions = questionTree.bfs_order(questions)
        if isinstance(questions, str):
            error_message = questions
            # revert created form template
            crud.delete(formTemplate)
            # error occurs when producing bfs order
            abort(404, message=error_message)

        # create questions
        questions = marshal.unmarshal_question_list(questions)
        crud.create_all(questions, autocommit=True)

        data.db_session.refresh(formTemplate)

        return marshal.marshal(formTemplate, shallow=True), 201

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/form-templates-get.yml",
        methods=["GET"],
        endpoint="form_templates",
    )
    def get():
        form_templates = crud.read_all(FormTemplate)
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
    @roles_required([RoleEnum.ADMIN])
    @swag_from(
        "../../specifications/single-form-template-put.yml",
        methods=["PUT"],
        endpoint="single_form_template",
    )
    def put(form_template_id: str):
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form template with id {form_template_id}")

        req = request.get_json(force=True)

        error_message = formTemplates.validate_template(req)
        if error_message:
            abort(404, message=error_message)

        questions = split_question(req)
        error_message = formTemplates.validate_questions(questions)
        if error_message:
            abort(404, message=error_message)

        for q in questions:
            q["formTemplateId"] = form_template_id

        questions = questionTree.bfs_order(questions)
        if isinstance(questions, str):
            # error occurs when producing bfs order
            error_message = questions
            abort(404, message=error_message)

        # remove all old related questions
        crud.delete_all(Question, formTemplateId=form_template_id)
        data.db_session.commit()

        # create new questions
        questions = marshal.unmarshal_question_list(questions)
        crud.create_all(questions, autocommit=False)

        # manually update lastEdited field as question updates will not
        # trigger auto-update for template
        req["lastEdited"] = get_current_time()
        crud.update(FormTemplate, req, id=form_template_id)
        data.db_session.commit()
        data.db_session.refresh(form_template)

        return marshal.marshal(form_template, shallow=True), 201


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
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form with id {form_template_id}")

        form_template = serialize.serialize_blank_form_template(form_template)

        return form_template


# ------Helper Function------------------------------#
def split_question(req: dict) -> dict:
    # split out the question part of template
    questions = req["questions"]
    del req["questions"]
    return questions
