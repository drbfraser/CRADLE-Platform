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
from validation import forms
from models import Patient, Form, FormTemplate, User


# /api/forms/responses
class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/forms-post.yml",
        methods=["POST"],
        endpoint="forms"
    )
    def post():
        req = request.get_json(force=True)

        error_message = forms.validate_post_request(req)
        if error_message is not None:
            abort(400, message=error_message)

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

        return marshal.marshal(form, True), 201


# /api/forms/responses/<int:form_id>
class SingleForm(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-form-get.yml",
        methods=["GET"],
        endpoint="single_form"
    )
    def get(form_id: int):
        form = crud.read(Form, id=form_id)
        if not form:
            abort(404, message=f"No form with id {form_id}")

        return marshal.marshal(form, False)

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-form-put.yml",
        methods=["PUT"],
        endpoint="single_form"
    )
    def put(form_id: int):
        form = crud.read(Form, id=form_id)
        if not form:
            abort(404, message=f"No form with id {form_id}")

        req = request.get_json(force=True)

        error_message = forms.validate_put_request(req)
        if error_message is not None:
            abort(400, message=error_message)

        questions_upload = req["questions"]
        questions = form.questions
        if len(questions_upload) != len(questions):
            abort(
                404,
                message=f"Length of questions in request and in server are not equal",
            )

        question_ids = [q.id for q in questions]
        questions_dict = dict(zip(question_ids, questions))
        for q in questions_upload:
            qid = q["id"]
            if qid not in question_ids:
                abort(
                    404, message=f"request question id={qid} does not exist in server"
                )
            qans = json.dumps(q["answers"])
            if qans != questions_dict[qid].answers:
                questions_dict[qid].answers = qans

        user = get_jwt_identity()
        user_id = int(user["userId"])
        form.lastEditedBy = user_id
        form.lastEdited = get_current_time()

        data.db_session.commit()
        data.db_session.refresh(form)

        return marshal.marshal(form, False)
