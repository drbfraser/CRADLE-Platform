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
    def post():
        req = request.get_json(force=True)
        
        questions = req["questions"]
        # TODO: validate a question part

        formTemplate = marshal.unmarshal(FormTemplate, req)

        crud.create(formTemplate, refresh=True)

        return marshal.marshal(formTemplate), 201

    @staticmethod
    @jwt_required
    def get():
        form_templates = crud.read_all(FormTemplate)
        return [marshal.marshal(f) for f in form_templates]


# /api/forms/templates/<int:form_template_id>
class SingleFormTemplate(Resource):
    @staticmethod
    @jwt_required
    def get(form_template_id: int):
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form with id {form_template_id}")
        
        questions = crud.read_questions(Question, form_template.id)
        
        return serialize.serialize_form_template(form_template, questions)
        

    @staticmethod
    @jwt_required
    def put(form_template_id: int):
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form template with id {form_template_id}")
        
        req = request.get_json(force=True)

        # validate req

        questions = json.loads(form_template.questions)
        question_ids = [q["question_id"] for q in questions]
        questions_dict = dict(zip(question_ids, questions))
        new_questions = list(questions_dict.values())
        req["questions"] = json.dumps(new_questions)

        crud.update(FormTemplate, req, id=form_template_id)
        data.db_session.commit()
        data.db_session.refresh(form_template)

        return marshal.marshal(form_template)


# /api/forms/templates/blank/<int:form_template_id>
class BlankFormTemplate(Resource):
    @staticmethod
    @jwt_required
    def get(form_template_id: int):
        form_template = crud.read(FormTemplate, id=form_template_id)
        if not form_template:
            abort(404, message=f"No form with id {form_template_id}")
        
        return marshal.marshal(form_template)


