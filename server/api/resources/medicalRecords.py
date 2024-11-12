import logging

from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

from api import util
from api.decorator import patient_association_required
from data import crud, marshal
from models import MedicalRecord
from service import serialize, view
from utils import get_current_time
from validation.medicalRecords import MedicalRecordValidator
from validation.validation_exception import ValidationExceptionError

LOGGER = logging.getLogger(__name__)


# /api/patients/<string:patient_id>/medical_records
class Root(Resource):
    @staticmethod
    @patient_association_required()
    @swag_from(
        "../../specifications/medical-records-get.yml",
        methods=["Get"],
        endpoint="medical_records",
    )
    def get(patient_id: str):
        params = util.get_query_params(request)

        medical = view.medical_record_view(patient_id, False, **params)
        drug = view.medical_record_view(patient_id, True, **params)

        return {
            "medical": [serialize.serialize_medical_record(r) for r in medical],
            "drug": [serialize.serialize_medical_record(r) for r in drug],
        }

    @staticmethod
    @patient_association_required()
    @swag_from(
        "../../specifications/medical-records-post.yml",
        methods=["POST"],
        endpoint="medical_records",
    )
    def post(patient_id: str):
        request_body = request.get_json(force=True)
        print("debuggg")
        print(request_body)

        try:
            medical_record_pydantic_model = (
                MedicalRecordValidator.validate_post_request(request_body, patient_id)
            )
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        new_medical_record = medical_record_pydantic_model.model_dump()
        new_medical_record = util.filterPairsWithNone(new_medical_record)

        print("debuggg2")
        print(new_medical_record)
        if "id" in new_medical_record:
            record_id = new_medical_record.get("id")
            if crud.read(MedicalRecord, id=record_id):
                abort(
                    409,
                    message=f"A medical record with ID {record_id} already exists.",
                )

        _process_request_body(new_medical_record)
        new_medical_record["patientId"] = patient_id
        new_medical_record["dateCreated"] = get_current_time()
        new_record = marshal.unmarshal(MedicalRecord, new_medical_record)

        crud.create(new_record, refresh=True)

        return marshal.marshal(new_record), 201


# /api/medical_records/<string:record_id>
class SingleMedicalRecord(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-medical-record-get.yml",
        methods=["GET"],
        endpoint="single_medical_record",
    )
    def get(record_id: str):
        record = _get_medical_record(record_id)

        return marshal.marshal(record)

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-medical-record-put.yml",
        methods=["PUT"],
        endpoint="single_medical_record",
    )
    def put(record_id: str):
        request_body = request.get_json(force=True)

        try:
            medical_record_pydantic_model = MedicalRecordValidator.validate_put_request(
                request_body, record_id,
            )
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        update_medical_record = medical_record_pydantic_model.model_dump()
        update_medical_record = util.filterPairsWithNone(update_medical_record)

        if "patientId" in update_medical_record:
            patient_id = crud.read(MedicalRecord, id=record_id).patientId
            if update_medical_record.get("patientId") != patient_id:
                abort(400, message="Patient ID cannot be changed.")

        _process_request_body(update_medical_record)
        crud.update(MedicalRecord, update_medical_record, id=record_id)

        new_record = crud.read(MedicalRecord, id=record_id)

        return marshal.marshal(new_record)

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-medical-record-delete.yml",
        methods=["DELETE"],
        endpoint="single_medical_record",
    )
    def delete(record_id: str):
        record = _get_medical_record(record_id)
        crud.delete(record)

        return {"message": "Medical record deleted"}


def _process_request_body(request_body):
    request_body["lastEdited"] = get_current_time()
    request_body["isDrugRecord"] = "drugHistory" in request_body
    request_body["information"] = (
        request_body.pop("drugHistory")
        if request_body["isDrugRecord"]
        else request_body.pop("medicalHistory")
    )


def _get_medical_record(record_id):
    record = crud.read(MedicalRecord, id=record_id)
    if not record:
        abort(404, message=f"No medical record with id {record_id}")

    return record
