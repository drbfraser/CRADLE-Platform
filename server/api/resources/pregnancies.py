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
        kwargs = {
            "search": util.query_param_search(request, name="search"),
            "sort_dir": util.query_param_sort_dir(request, name="sortDir"),
            "page": util.query_param_page(request, name="page"),
            "limit": util.query_param_limit(request, name="limit"),
        }

        pregnancies = view.pregnancy_view(patient_id, **kwargs)

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
            pregnancy_id = request_body.get("id")
            if crud.read(Pregnancy, id=pregnancy_id):
                abort(
                    409, message=f"A pregnancy with ID {pregnancy_id} already exists."
                )

        _process(request_body)
        request_body["patientId"] = patient_id
        new_pregnancy = marshal.unmarshal(Pregnancy, request_body)

        crud.create(new_pregnancy, refresh=True)

        return marshal.marshal(new_pregnancy), 201


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

        return {
            "isPregnant": False if pregnancy.endDate else True,
            "patientId": pregnancy.patientId,
            "startDate": pregnancy.startDate,
            "defaultTimeUnit": pregnancy.defaultTimeUnit.value,
            "endDate": pregnancy.endDate,
            "outcome": pregnancy.outcome,
        }


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
        request_body = request.get_json(force=True)

        error = pregnancies.validate_put_request(request_body, pregnancy_id)
        if error:
            abort(400, message=error)

        if "patientId" in request_body:
            patient_id = crud.read(Pregnancy, id=pregnancy_id).patientId
            if request_body.get("patientId") != patient_id:
                abort(400, message="Patient ID cannot be changed.")

        _process(request_body)
        crud.update(Pregnancy, request_body, id=pregnancy_id)

        new_pregnancy = crud.read(Pregnancy, id=pregnancy_id)

        return marshal.marshal(new_pregnancy)


def _process(d):
    d["lastEdited"] = get_current_time()
    if "pregnancyStartDate" in d:
        d["startDate"] = d.pop("pregnancyStartDate")
    if "gestationalAgeUnit" in d:
        d["defaultTimeUnit"] = d.pop("gestationalAgeUnit")
    if "pregnancyEndDate" in d:
        d["endDate"] = d.pop("pregnancyEndDate")
    if "pregnancyOutcome" in d:
        d["outcome"] = d.pop("pregnancyOutcome")
