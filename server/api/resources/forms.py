import json

from flasgger import swag_from
from flask import request
from flask_restful import Resource, abort

import data
from api import util
from common import commonUtil, user_utils
from data import crud, marshal
from models import FormOrm, FormTemplateOrm, PatientOrm, UserOrm
from utils import get_current_time
from validation.forms import FormPutValidator, FormValidator
from validation.validation_exception import ValidationExceptionError


# /api/forms/responses
class Root(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/forms-post.yml",
        methods=["POST"],
        endpoint="forms",
    )
    def post():
        request_json = request.get_json(force=True)

        if request_json.get("id") is not None:
            if crud.read(FormOrm, id=request_json["id"]):
                abort(409, message="Form already exists")
                return None

        try:
            form_pydantic_model = FormValidator.validate(request_json)
        except ValidationExceptionError as e:
            abort(400, message=str(e))
            return None

        new_form = form_pydantic_model.model_dump()
        new_form = commonUtil.filterNestedAttributeWithValueNone(new_form)

        patient = crud.read(PatientOrm, id=new_form["patient_id"])
        if not patient:
            abort(404, message="Patient does not exist")
            return None

        if new_form.get("form_template_id") is not None:
            form_template = crud.read(FormTemplateOrm, id=new_form["form_template_id"])
            if not form_template:
                abort(404, message="Form template does not exist")
                return None
            if (
                form_template.form_classification_id
                != new_form["form_classification_id"]
            ):
                abort(404, message="Form classification does not match template")
                return None

        if new_form.get("last_edited_by") is not None:
            user = crud.read(UserOrm, id=new_form["last_edited_by"])
            if not user:
                abort(404, message="User does not exist")
                return None
        else:
            current_user = user_utils.get_current_user_from_jwt()
            user_id = int(current_user["id"])
            new_form["last_edited_by"] = user_id

        util.assign_form_or_template_ids(FormOrm, new_form)

        form = marshal.unmarshal(FormOrm, new_form)

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

        current_user = user_utils.get_current_user_from_jwt()
        user_id = int(current_user["id"])
        form.last_edited_by = user_id
        form.last_edited = get_current_time()

        data.db_session.commit()
        data.db_session.refresh(form)

        return marshal.marshal(form, True), 201
