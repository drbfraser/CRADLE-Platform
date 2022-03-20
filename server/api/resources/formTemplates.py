import time
from math import floor
from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource, abort
import json

import api.util as util
import data
import data.crud as crud
import data.marshal as marshal
from utils import get_current_time
import service.assoc as assoc
import service.serialize as serialize
import service.view as view
from models import Patient, Form, FormTemplate, Question
import service.serialize as serialize


# /api/forms/templates
class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/form-templates-post.yml",
        methods=["POST"],
        endpoint="form_templates",
    )
    def post():
        req = request.get_json(force=True)

        questions = req["questions"]
        # TODO: validate a question part

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


# /api/forms/templates/<int:form_template_id>
class SingleFormTemplate(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-form-template-get.yml",
        methods=["GET"],
        endpoint="single_form_template",
    )
    def get(form_template_id: int):
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form with id {form_template_id}")

        questions = crud.read_questions(Question, form_template.id)

        return serialize.serialize_form_template(form_template, questions)

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-form-template-put.yml",
        methods=["PUT"],
        endpoint="single_form_template",
    )
    def put(form_template_id: int):
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form template with id {form_template_id}")

        req = request.get_json(force=True)

        # validate req
        formTemplate = marshal.unmarshal(FormTemplate, req)

        # create new questions if id not in database
        questions = crud.read_questions(Question, form_template.id)
        ids = [question.id for question in questions]
        for question in formTemplate.questions:
            if question.id not in ids:
                crud.create(question)

        new_ids = [question.id for question in formTemplate.questions]
        for question in questions:
            if question.id not in new_ids:
                crud.delete(question)

        crud.update(FormTemplate, req, id=form_template_id)
        data.db_session.commit()
        data.db_session.refresh(form_template)

        return marshal.marshal(form_template)


# /api/forms/templates/blank/<int:form_template_id>
class BlankFormTemplate(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/blank-form-template-get.yml",
        methods=["GET"],
        endpoint="blank_form_template",
    )
    def get(form_template_id: int):
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form with id {form_template_id}")

        questions = crud.read_questions(Question, form_template.id)

        form_template = serialize.serialize_form_template(form_template, questions)
        del form_template["dateCreated"]
        del form_template["lastEdited"]
        del form_template["version"]

        return form_template
