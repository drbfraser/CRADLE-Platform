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
import service.view as view
from models import Patient, Form, FormTemplate, User
import service.serialize as serialize


# /api/forms/responses
class Root(Resource):
    @staticmethod
    @jwt_required
    def post():
        # TODO: post a new referral form
        req = request.get_json(force=True)

        # TODO: validate req

        patient = crud.read(Patient, patientId=req["patientId"])
        if not patient:
            abort(400, message="Patient does not exist")
        
        form_template = crud.read(FormTemplate, id=req["formTemplateId"])
        if not form_template:
            abort(400, message="Form template does not exist")

        user = crud.read(User, id=req["lastEditedBy"])
        if not user:
            abort(400, message="User does not exist")
            
        form = marshal.unmarshal(Form, req)
        # first time when the form is created lastEdited is same to dateCreated
        form.lastEdited = form.dateCreated
        crud.create(form, refresh=True)

        return marshal.marshal(form), 201


# /api/forms/responses/<int:form_id>
class SingleForm(Resource):
    @staticmethod
    @jwt_required
    def get(form_id: int):
        form = crud.read(Form, id=form_id)
        if not form:
            abort(404, message=f"No form with id {form_id}")
        
        return marshal.marshal(form)
        

    @staticmethod
    @jwt_required
    def put(form_id: int):
        # TODO: edit a single referral form
        form = crud.read(Form, id=form_id)
        if not form:
            abort(404, message=f"No form with id {form_id}")
        
        req = request.get_json(force=True)

        # validate req

        answers_upload = req["questions"]
        questions = json.loads(form.questions)
        question_ids = [q["question_id"] for q in questions]
        questions_dict = dict(zip(question_ids, questions))
        for r in answers_upload:
            if r["question_id"] in question_ids:
                questions_dict[r["question_id"]]["answer_value"] = r["answer_value"]
        new_questions = list(questions_dict.values())
        req["questions"] = json.dumps(new_questions)

        crud.update(Form, req, id=form_id)
        data.db_session.commit()
        data.db_session.refresh(form)

        return marshal.marshal(form)



