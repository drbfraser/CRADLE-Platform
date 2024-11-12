import json

from flasgger import swag_from
from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource, abort

import data
from api import util
from common import commonUtil
from data import crud, marshal
from models import Form, FormTemplate, Patient, User
from utils import get_current_time
from validation.forms import FormPutValidator, FormValidator
from validation.validation_exception import ValidationExceptionError


# /api/forms/responses
class Root(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/forms-post.yml",
        methods=["POST"],
        endpoint="forms",
    )
    def post():
        request_json = request.get_json(force=True)

        if request_json.get("id") is not None:
            if crud.read(Form, id=request_json["id"]):
                abort(409, message="Form already exists")

        try:
            form_pydantic_model = FormValidator.validate(request_json)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        new_form = form_pydantic_model.model_dump()
        new_form = commonUtil.filterNestedAttributeWithValueNone(new_form)

        patient = crud.read(Patient, patientId=new_form["patientId"])
        if not patient:
            abort(404, message="Patient does not exist")

        if new_form.get("formTemplateId") is not None:
            form_template = crud.read(FormTemplate, id=new_form["formTemplateId"])
            if not form_template:
                abort(404, message="Form template does not exist")
            elif form_template.formClassificationId != new_form["formClassificationId"]:
                abort(404, message="Form classification does not match template")

        if new_form.get("lastEditedBy") is not None:
            user = crud.read(User, id=new_form["lastEditedBy"])
            if not user:
                abort(404, message="User does not exist")
        else:
            user = get_jwt_identity()
            user_id = int(user["userId"])
            new_form["lastEditedBy"] = user_id

        util.assign_form_or_template_ids(Form, new_form)

        form = marshal.unmarshal(Form, new_form)

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
        print("debugggg")
        print(form_id)
        form = crud.read(Form, id=form_id)
        if not form:
            abort(404, message=f"No form with id {form_id}")

        request_json = request.get_json(force=True)
        try:
            form_pydantic_model = FormPutValidator.validate(request_json)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        update_form = form_pydantic_model.model_dump()
        update_form = commonUtil.filterNestedAttributeWithValueNone(update_form)

        questions_upload = update_form["questions"]
        questions = form.questions
        question_ids = [q.id for q in questions]
        questions_dict = dict(zip(question_ids, questions))
        for q in questions_upload:
            qid = q["id"]
            if qid not in question_ids:
                abort(
                    404,
                    message=f"request question id={qid} does not exist in server",
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
