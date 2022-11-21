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
from api.decorator import patient_association_required


# /api/patients/<string:patient_id>/pregnancies
class Root(Resource):
    @staticmethod
    @patient_association_required()
    @swag_from(
        "../../specifications/pregnancies-get.yml",
        methods=["Get"],
        endpoint="pregnancies",
    )
    def get(patient_id: str):
        params = util.get_query_params(request)
        pregnancies = view.pregnancy_view(patient_id, **params)

        return [serialize.serialize_pregnancy(p) for p in pregnancies]

    @staticmethod
    @patient_association_required()
    @swag_from(
        "../../specifications/pregnancies-post.yml",
        methods=["POST"],
        endpoint="pregnancies",
    )
    def post(patient_id: str):
        request_body = request.get_json(force=True)

        error = pregnancies.validate_post_request(request_body, patient_id)
        if error:
            abort(400, message=error)

        if "id" in request_body:
            pregnancy_id = request_body["id"]
            if crud.read(Pregnancy, id=pregnancy_id):
                abort(
                    409,
                    message=f"A pregnancy record with ID {pregnancy_id} already exists.",
                )

        _process_request_body(request_body)
        _check_conflicts(request_body, patient_id)

        request_body["patientId"] = patient_id
        new_pregnancy = marshal.unmarshal(Pregnancy, request_body)
        crud.create(new_pregnancy, refresh=True)

        return marshal.marshal(new_pregnancy), 201


# /api/pregnancies/<string:pregnancy_id>
class SinglePregnancy(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-pregnancy-get.yml",
        methods=["GET"],
        endpoint="single_pregnancy",
    )
    def get(pregnancy_id: str):
        pregnancy = _get_pregnancy(pregnancy_id)

        return marshal.marshal(pregnancy)

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-pregnancy-put.yml",
        methods=["PUT"],
        endpoint="single_pregnancy",
    )
    def put(pregnancy_id: str):
        request_body = request.get_json(force=True)

        error = pregnancies.validate_put_request(request_body, pregnancy_id)
        if error:
            abort(400, message=error)

        _process_request_body(request_body)

        pregnancy = crud.read(Pregnancy, id=pregnancy_id)
        if (
            "patientId" in request_body
            and request_body["patientId"] != pregnancy.patientId
        ):
            abort(400, message="Patient ID cannot be changed.")
        if "startDate" not in request_body:
            request_body["startDate"] = pregnancy.startDate

        _check_conflicts(request_body, pregnancy.patientId, pregnancy_id)

        crud.update(Pregnancy, request_body, id=pregnancy_id)
        new_pregnancy = crud.read(Pregnancy, id=pregnancy_id)

        return marshal.marshal(new_pregnancy)

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-pregnancy-delete.yml",
        methods=["DELETE"],
        endpoint="single_pregnancy",
    )
    def delete(pregnancy_id: str):
        pregnancy = _get_pregnancy(pregnancy_id)
        crud.delete(pregnancy)

        return {"message": "Pregnancy record deleted"}


def _process_request_body(request_body):
    request_body["lastEdited"] = get_current_time()
    if "pregnancyStartDate" in request_body:
        request_body["startDate"] = request_body.pop("pregnancyStartDate")
    if "gestationalAgeUnit" in request_body:
        request_body["defaultTimeUnit"] = request_body.pop("gestationalAgeUnit")
    if "pregnancyEndDate" in request_body:
        request_body["endDate"] = request_body.pop("pregnancyEndDate")
    if "pregnancyOutcome" in request_body:
        request_body["outcome"] = request_body.pop("pregnancyOutcome")


def _check_conflicts(request_body, patient_id, pregnancy_id=None):
    start_date = request_body.get("startDate")
    end_date = request_body.get("endDate")
    if crud.has_conflicting_pregnancy_record(
        patient_id, start_date, end_date, pregnancy_id
    ):
        abort(409, message="A conflict with existing pregnancy records occurred.")


def _get_pregnancy(pregnancy_id):
    pregnancy = crud.read(Pregnancy, id=pregnancy_id)
    if not pregnancy:
        abort(404, message=f"No pregnancy record with id {pregnancy_id}")

    return pregnancy
