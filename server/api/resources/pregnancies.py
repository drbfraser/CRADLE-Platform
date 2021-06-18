from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import data.crud as crud
import data.marshal as marshal
import service.serialize as serialize
import service.view as view
from models import Pregnancy
from validation import pregnancies
from utils import get_current_time


# /api/patients/<string:patient_id>/pregnancies
class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/pregnancies-get.yml",
        methods=["Get"],
        endpoint="pregnancies",
    )
    def get(patient_id: str):
        pregnancies = crud.read_all(Pregnancy, patientId=patient_id)

        return [serialize.serialize_pregnancy(p) for p in pregnancies]

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/pregnancies-post.yml",
        methods=["POST"],
        endpoint="pregnancies",
    )
    def post(patient_id: str):
        json = request.get_json(force=True)

        error = pregnancies.validate_post_request(json, patient_id)
        if error:
            abort(400, message=error)

        pregnancy = marshal.unmarshal(Pregnancy, json)

        pregnancy.lastEdited = get_current_time()

        crud.create(pregnancy, refresh=True)

        return marshal.marshal(pregnancy), 201


# /api/patients/<string:patient_id>/pregnancies/status
class PregnancyStatus(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/pregnancy-status-get.yml",
        methods=["GET"],
        endpoint="pregnancy_status",
    )
    def get(patient_id: str):
        pregnancy = crud.get_pregnancy_status(patient_id)

        if not pregnancy:
            return {"isPregnant": False}

        return marshal.marshal(pregnancy)


# /api/pregnancies/<string:pregnancy_id>
class SinglePregnancy(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-pregnancy-get.yml",
        methods=["GET"],
        endpoint="single_pregnancy",
    )
    def get(pregnancy_id: str):
        pregnancy = crud.read(Pregnancy, id=pregnancy_id)
        if not pregnancy:
            abort(404, message=f"No pregnancy with id {pregnancy_id}")

        return marshal.marshal(pregnancy)

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-pregnancy-put.yml",
        methods=["PUT"],
        endpoint="single_pregnancy",
    )
    def put(pregnancy_id: str):
        json = request.get_json(force=True)

        error = pregnancies.validate_put_request(json, pregnancy_id)
        if error:
            abort(400, message=error)

        crud.update(Pregnancy, json, id=pregnancy_id)

        pregnancy = crud.read(Pregnancy, id=pregnancy_id)

        return marshal.marshal(pregnancy)
