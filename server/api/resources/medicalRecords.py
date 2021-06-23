from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import data.crud as crud
import data.marshal as marshal
import service.serialize as serialize
import service.view as view
from models import MedicalRecord

from validation import medicalRecords
from utils import get_current_time


# /api/patients/<string:patient_id>/medical_records
class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/medical-records-get.yml",
        methods=["Get"],
        endpoint="medical_records",
    )
    def get(patient_id: str):
        medicalRecords = crud.read_all(MedicalRecord, patientId=patient_id)

        return [serialize.serialize_medical_record(r) for r in medicalRecords]

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/medical-records-post.yml",
        methods=["POST"],
        endpoint="medical_records",
    )
    def post(patient_id: str):
        request_body = request.get_json(force=True)

        error = medicalRecords.validate_post_request(request_body, patient_id)
        if error:
            abort(400, message=error)

        if "id" in request_body:
            record_id = request_body.get("id")
            if crud.read(MedicalRecord, id=record_id):
                abort(
                    409, message=f"A medical record with ID {record_id} already exists."
                )

        new_record = marshal.unmarshal(MedicalRecord, request_body)

        new_record.dateCreated = new_record.lastEdited = get_current_time()

        crud.create(new_record, refresh=True)

        return marshal.marshal(new_record), 201


# /api/medical_records/<string:record_id>
class SingleMedicalRecord(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-medical-record-get.yml",
        methods=["GET"],
        endpoint="single_medical_record",
    )
    def get(record_id: str):
        record = crud.read(MedicalRecord, id=record_id)
        if not record:
            abort(404, message=f"No medical record with id {record_id}")

        return marshal.marshal(record)

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-medical-record-put.yml",
        methods=["PUT"],
        endpoint="single_medical_record",
    )
    def put(record_id: str):
        request_body = request.get_json(force=True)

        error = medicalRecords.validate_put_request(request_body, record_id)
        if error:
            abort(400, message=error)

        if "patientId" in request_body:
            patient_id = crud.read(MedicalRecord, id=record_id).patientId
            if request_body.get("patientId") != patient_id:
                abort(400, message="Patient ID cannot be changed.")

        request_body["lastEdited"] = get_current_time()

        crud.update(MedicalRecord, request_body, id=record_id)

        new_record = crud.read(MedicalRecord, id=record_id)

        return marshal.marshal(new_record)
