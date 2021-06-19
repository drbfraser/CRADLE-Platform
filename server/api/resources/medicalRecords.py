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


# /api/patients/<string:patient_id>/medicalRecords
class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/medicalRecords-get.yml",
        methods=["Get"],
        endpoint="medicalRecords",
    )
    def get(patient_id: str):
        medicalRecords = crud.read_all(MedicalRecord, patientId=patient_id)

        return [serialize.serialize_medicalRecord(r) for r in medicalRecords]

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/medicalRecords-post.yml",
        methods=["POST"],
        endpoint="medicalRecords",
    )
    def post(patient_id: str):
        json = request.get_json(force=True)

        error = medicalRecords.validate_post_request(json, patient_id)
        if error:
            abort(400, message=error)

        record = marshal.unmarshal(MedicalRecord, json)

        record.lastEdited = get_current_time()

        crud.create(record, refresh=True)

        return marshal.marshal(record), 201


# /api/medicalRecords/<string:record_id>
class SingleMedicalRecord(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-medicalRecord-get.yml",
        methods=["GET"],
        endpoint="single_medicalRecord",
    )
    def get(record_id: str):
        record = crud.read(MedicalRecord, id=record_id)
        if not record:
            abort(404, message=f"No medical record with id {record_id}")

        return marshal.marshal(record)

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-medicalRecord-put.yml",
        methods=["PUT"],
        endpoint="single_medicalRecord",
    )
    def put(record_id: str):
        json = request.get_json(force=True)

        error = medicalRecords.validate_put_request(json, record_id)
        if error:
            abort(400, message=error)

        crud.update(MedicalRecord, json, id=record_id)

        record = crud.read(MedicalRecord, id=record_id)

        return marshal.marshal(record)

