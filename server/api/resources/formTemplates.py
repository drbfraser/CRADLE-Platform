from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import data
import data.crud as crud
import data.marshal as marshal
import service.serialize as serialize
from models import FormTemplate, Question, RoleEnum
import service.serialize as serialize
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

        error_message = formTemplates.validate(req)
        if error_message:
            abort(404, message=error_message)

        formTemplate = marshal.unmarshal(FormTemplate, req)

        crud.create(formTemplate, refresh=True)

        return marshal.marshal(formTemplate), 201

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/form-templates-get.yml",
        methods=["GET"],
        endpoint="form_templates",
    )
    def get():
        form_templates = crud.read_all(FormTemplate)
        return [marshal.marshal(f) for f in form_templates]


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
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form with id {form_template_id}")

        return marshal.marshal(form_template, False)

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

        error_message = formTemplates.validate(req)
        if error_message:
            abort(404, message=error_message)

        # remove all old related questions
        old_qids = [question.id for question in form_template.questions]
        for old_qid in old_qids:
            crud.delete_by(Question, id=old_qid)
        data.db_session.commit()

        # create new questions
        new_questions = marshal.unmarshal_question_list(req)
        for new_question in new_questions:
            new_question.formTemplateId = form_template_id
            crud.create(new_question)

        # manually update lastEdited field as question updates will not
        # trigger auto-update for template
        req["lastEdited"] = get_current_time()
        crud.update(FormTemplate, req, id=form_template_id)
        data.db_session.commit()
        data.db_session.refresh(form_template)

        return marshal.marshal(form_template)


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
