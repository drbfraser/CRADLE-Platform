import logging

from flask import abort
from flask_openapi3.blueprint import APIBlueprint

from api.decorator import patient_association_required
from api.resources.patients import api_patients
from common.api_utils import (
    PatientIdPath,
    RecordIdPath,
    SearchFilterQueryParams,
)
from data import crud, marshal
from models import MedicalRecordOrm
from service import serialize, view
from utils import get_current_time
from validation.medicalRecords import MedicalRecordValidator

LOGGER = logging.getLogger(__name__)


# /api/patients/<string:patient_id>/medical_records [GET]
@patient_association_required()
@api_patients.get("/<string:patient_id>/medical_records")
def get_patients_medical_records(path: PatientIdPath, query: SearchFilterQueryParams):
    params = query.model_dump()
    medical = view.medical_record_view(path.patient_id, False, **params)
    drug = view.medical_record_view(path.patient_id, True, **params)

    return {
        "medical": [serialize.serialize_medical_record(r) for r in medical],
        "drug": [serialize.serialize_medical_record(r) for r in drug],
    }


# /api/patients/<string:patient_id>/medical_records [POST]
@patient_association_required()
@api_patients.post("/<string:patient_id>/medical_records")
def create_medical_record(path: PatientIdPath, body: MedicalRecordValidator):
    if body.id is not None:
        if crud.read(MedicalRecordOrm, id=body.id) is not None:
            return abort(
                409,
                description=f"A medical record with ID {body.id} already exists.",
            )

    body.patient_id = path.patient_id
    new_medical_record = body.model_dump()
    new_medical_record = _process_request_body(new_medical_record)
    new_record = marshal.unmarshal(MedicalRecordOrm, new_medical_record)

    crud.create(new_record, refresh=True)

    return marshal.marshal(new_record), 201


api_medical_records = APIBlueprint(
    name="medical_records",
    import_name=__name__,
    url_prefix="/medical_records",
)


# /api/medical_records/<string:record_id> [GET]
@api_medical_records.get("/<string:record_id>")
def get_medical_record(path: RecordIdPath):
    record = _get_medical_record(path.record_id)
    return marshal.marshal(record)


# /api/medical_records/<string:record_id> [PUT]
@api_medical_records.put("/<string:record_id>")
def update_medical_record(path: RecordIdPath, body: MedicalRecordValidator):
    update_medical_record = body.model_dump()

    old_record = crud.read(MedicalRecordOrm, id=path.record_id)
    if old_record is None:
        return abort(404, description=f"No Medical Record with ID: {path.record_id}")

    if body.patient_id != old_record.patient_id:
        return abort(400, description="Patient ID cannot be changed.")

    _process_request_body(update_medical_record)
    crud.update(MedicalRecordOrm, update_medical_record, id=path.record_id)

    new_record = crud.read(MedicalRecordOrm, id=path.record_id)
    record_dict = marshal.marshal(new_record)
    return record_dict, 200


# /api/medical_records/<string:record_id> [DELETE]
@api_medical_records.delete("/<string:record_id>")
def delete_medical_record(path: RecordIdPath):
    record = _get_medical_record(path.record_id)
    crud.delete(record)
    return {"message": f"Deleted Medical Record with ID: {path.record_id}"}, 200


def _process_request_body(request_body):
    request_body["last_edited"] = get_current_time()
    # TODO: We should really refactor drug records into a separate Database model.
    if "is_drug_record" not in request_body or request_body["is_drug_record"] is None:
        request_body["is_drug_record"] = (
            "drug_history" in request_body and request_body["drug_history"] is not None
        )
    request_body["information"] = (
        request_body.pop("drug_history")
        if request_body["is_drug_record"]
        else request_body.pop("medical_history")
    )
    return request_body


def _get_medical_record(record_id):
    record = crud.read(MedicalRecordOrm, id=record_id)
    if record is None:
        return abort(404, description=f"No medical record with ID: {record_id}")
    return record
