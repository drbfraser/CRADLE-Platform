import json

from flasgger import swag_from
from flask import request
from flask_restful import Resource, abort
from pydantic import ValidationError

import data
from api import util
from data import crud, marshal
from models import FormOrm, FormTemplateOrm, PatientOrm, UserOrm
from shared.user_utils import UserUtils
from utils import get_current_time
from validation import forms


# /api/forms/responses
class Root(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/forms-post.yml",
        methods=["POST"],
        endpoint="forms",
    )
    def post():
        req = request.get_json(force=True)

        if req.get("id") is not None:
            if crud.read(FormOrm, id=req["id"]):
                abort(409, message="Form already exists")
                return None

        try:
            forms.validate_form(req)
        except ValidationError as e:
            abort(400, message=str(e))
            return None

        patient = crud.read(PatientOrm, id=req["id"])
        if not patient:
            abort(404, message="Patient does not exist")
            return None

        if req.get("form_template_id") is not None:
            form_template = crud.read(FormTemplateOrm, id=req["form_template_id"])
            if not form_template:
                abort(404, message="Form template does not exist")
                return None
            if form_template.form_classification_id != req["form_classification_id"]:
                abort(404, message="Form classification does not match template")
                return None

        if req.get("last_edited_by") is not None:
            user = crud.read(UserOrm, id=req["last_edited_by"])
            if not user:
                abort(404, message="User does not exist")
                return None
        else:
            current_user = UserUtils.get_current_user_from_jwt()
            user_id = int(current_user["id"])
            req["last_edited_by"] = user_id

        util.assign_form_or_template_ids(FormOrm, req)

        form = marshal.unmarshal(FormOrm, req)

        form.date_created = get_current_time()
        form.last_edited = form.date_created

        crud.create(form, refresh=True)

        return marshal.marshal(form, shallow=True), 201


# /api/forms/responses/<string:form_id>
class SingleForm(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/single-form-get.yml",
        methods=["GET"],
        endpoint="single_form",
    )
    def get(form_id: str):
        form = crud.read(FormOrm, id=form_id)
        if not form:
            abort(404, message=f"No form with id {form_id}")
            return None

        return marshal.marshal(form, False)

    @staticmethod
    @swag_from(
        "../../specifications/single-form-put.yml",
        methods=["PUT"],
        endpoint="single_form",
    )
    def put(form_id: str):
        form = crud.read(FormOrm, id=form_id)
        if not form:
            abort(404, message=f"No form with id {form_id}")
            return None

        req = request.get_json(force=True)

        try:
            forms.validate_put_request(req)
        except ValidationError as e:
            abort(400, message=str(e))

        questions_upload = req["questions"]
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

        current_user = UserUtils.get_current_user_from_jwt()
        user_id = int(current_user["id"])
        form.last_edited_by = user_id
        form.last_edited = get_current_time()

        data.db_session.commit()
        data.db_session.refresh(form)

        return marshal.marshal(form, True), 201
