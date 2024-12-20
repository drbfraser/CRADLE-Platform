from flasgger import swag_from
from flask_restful import Resource, abort

from api import util
from api.decorator import patient_association_required
from common import api_utils
from data import crud, marshal
from models import PregnancyOrm
from service import serialize, view
from utils import get_current_time
from validation.pregnancies import (
    PregnancyPostRequestValidator,
    PregnancyPutRequestValidator,
)
from validation.validation_exception import ValidationExceptionError


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
        params = api_utils.get_query_params()
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
        request_body = api_utils.get_request_body()

        try:
            PregnancyPostRequestValidator.validate(
                request_body,
                patient_id,
            )
        except ValidationExceptionError as e:
            abort(400, message=str(e))
            return None

        if "id" in request_body:
            pregnancy_id = request_body["id"]
            if crud.read(PregnancyOrm, id=pregnancy_id):
                abort(
                    409,
                    message=f"A pregnancy record with ID {pregnancy_id} already exists.",
                )
                return None
        print(request_body)
        _process_request_body(request_body)
        _check_conflicts(request_body, patient_id)

        request_body["patient_id"] = patient_id
        new_pregnancy = marshal.unmarshal(PregnancyOrm, request_body)
        crud.create(new_pregnancy, refresh=True)

        return marshal.marshal(new_pregnancy), 201


# /api/pregnancies/<string:pregnancy_id>
class SinglePregnancy(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/single-pregnancy-get.yml",
        methods=["GET"],
        endpoint="single_pregnancy",
    )
    def get(pregnancy_id: str):
        pregnancy = _get_pregnancy(pregnancy_id)

        return marshal.marshal(pregnancy)

    @staticmethod
    @swag_from(
        "../../specifications/single-pregnancy-put.yml",
        methods=["PUT"],
        endpoint="single_pregnancy",
    )
    def put(pregnancy_id: str):
        request_body = api_utils.get_request_body()

        try:
            pregnancy_pydantic_model = PregnancyPutRequestValidator.validate(
                request_body,
                pregnancy_id,
            )
        except ValidationExceptionError as e:
            abort(400, message=str(e))
            return None

        pregnancy_model_dump = pregnancy_pydantic_model.model_dump()
        pregnancy_model_dump = util.filterPairsWithNone(pregnancy_model_dump)

        _process_request_body(pregnancy_model_dump)

        pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)
        if pregnancy is None:
            abort(400, message="No pregnancy found.")
            return None
        if (
            "patient_id" in pregnancy_model_dump
            and pregnancy_model_dump["patient_id"] != pregnancy.patient_id
        ):
            abort(400, message="Patient ID cannot be changed.")
        if "start_date" not in pregnancy_model_dump:
            pregnancy_model_dump["start_date"] = pregnancy.start_date

        _check_conflicts(pregnancy_model_dump, pregnancy.patient_id, pregnancy_id)

        crud.update(PregnancyOrm, pregnancy_model_dump, id=pregnancy_id)
        new_pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)

        return marshal.marshal(new_pregnancy)

    @staticmethod
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
    request_body["last_edited"] = get_current_time()
    if "pregnancy_start_date" in request_body:
        request_body["start_date"] = request_body.pop("pregnancy_start_date")
    if "pregnancyEndDate" in request_body:
        request_body["end_date"] = request_body.pop("pregnancy_end_date")
    if "pregnancy_outcome" in request_body:
        request_body["outcome"] = request_body.pop("pregnancy_outcome")


def _check_conflicts(request_body, patient_id, pregnancy_id=None):
    start_date = request_body.get("start_date")
    end_date = request_body.get("end_date")
    if crud.has_conflicting_pregnancy_record(
        patient_id,
        start_date,
        end_date,
        pregnancy_id,
    ):
        abort(409, message="A conflict with existing pregnancy records occurred.")
        return


def _get_pregnancy(pregnancy_id):
    pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)
    if not pregnancy:
        abort(404, message=f"No pregnancy record with id {pregnancy_id}")
        return None

    return pregnancy
