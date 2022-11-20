from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource, abort
import json

import data
import data.crud as crud
import data.marshal as marshal
from utils import get_current_time
from validation import forms
from models import Patient, Form, FormTemplate, User
import api.util as util


# /api/forms/responses
class Root(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/forms-post.yml", methods=["POST"], endpoint="forms"
    )
    def post():
        req = request.get_json(force=True)

        if req.get("id") is not None:
            if crud.read(Form, id=req["id"]):
                abort(409, message="Form already exists")

        error_message = forms.validate_form(req)
        if error_message is not None:
            abort(400, message=error_message)

        patient = crud.read(Patient, patientId=req["patientId"])
        if not patient:
            abort(404, message="Patient does not exist")

        if req.get("formTemplateId") is not None:
            form_template = crud.read(FormTemplate, id=req["formTemplateId"])
            if not form_template:
                abort(404, message="Form template does not exist")
            elif form_template.formClassificationId != req["formClassificationId"]:
                abort(404, message="Form classification does not match template")

        if req.get("lastEditedBy") is not None:
            user = crud.read(User, id=req["lastEditedBy"])
            if not user:
                abort(404, message="User does not exist")
        else:
            user = get_jwt_identity()
            user_id = int(user["userId"])
            req["lastEditedBy"] = user_id

        util.assign_form_or_template_ids(Form, req)

        form = marshal.unmarshal(Form, req)

        form.dateCreated = get_current_time()
        form.lastEdited = form.dateCreated

        crud.create(form, refresh=True)

        return marshal.marshal(form, shallow=True), 201


# /api/forms/responses/<string:form_id>
class SingleForm(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-form-get.yml",
        methods=["GET"],
        endpoint="single_form",
    )
    def get(form_id: str):
        form = crud.read(Form, id=form_id)
        if not form:
            abort(404, message=f"No form with id {form_id}")

        return marshal.marshal(form, False)

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-form-put.yml",
        methods=["PUT"],
        endpoint="single_form",
    )
    def put(form_id: str):
        form = crud.read(Form, id=form_id)
        if not form:
            abort(404, message=f"No form with id {form_id}")

        req = request.get_json(force=True)

        error_message = forms.validate_put_request(req)
        if error_message is not None:
            abort(400, message=error_message)

        questions_upload = req["questions"]
        questions = form.questions
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

        return marshal.marshal(form, True), 201
