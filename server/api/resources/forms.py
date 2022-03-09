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
from models import Patient, Form, FormTemplate
import service.serialize as serialize


# /api/forms/responses
class Root(Resource):
    @staticmethod
    @jwt_required
    def post():
        # TODO: post a new referral form
        req = request.get_json(force=True)

        patient = crud.read(Patient, patientId=req["patientId"])
        if not patient:
            abort(400, message="Patient does not exist")
        
        questions = req["questions"]
        # TODO: validate a question part

        form = marshal.unmarshal(Form, req)

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
        pass




