import logging

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from api.decorator import patient_association_required
from api.resources.patients import api_patients
from common.api_utils import (
    PatientIdPath,
    RecordIdPath,
    SearchFilterQueryParams,
)
from common.commonUtil import get_current_time
from data import crud, marshal
from models import MedicalRecordOrm
from service import serialize, view
from validation import CradleBaseModel
from validation.medicalRecords import (
    DrugHistory,
    MedicalRecordExamples,
    MedicalRecordList,
    MedicalRecordModel,
)

LOGGER = logging.getLogger(__name__)

medical_records_tag = Tag(name="Medical Records", description="")


class GetMedicalRecordsResponse(CradleBaseModel):
    medical: MedicalRecordList
    drug: MedicalRecordList

    model_config = dict(
        openapi_extra={
            "example": {
                "medical": [MedicalRecordExamples.medical_record],
                "drug": [MedicalRecordExamples.drug_record],
            }
        }
    )


# /api/patients/<string:patient_id>/medical_records [GET]
@patient_association_required()
@api_patients.get(
    "/<string:patient_id>/medical_records",
    tags=[medical_records_tag],
    responses={200: GetMedicalRecordsResponse},
)
def get_patients_medical_records(path: PatientIdPath, query: SearchFilterQueryParams):
    """Get Patient's Medical Records"""
    params = query.model_dump()
    medical = view.medical_record_view(path.patient_id, False, **params)
    drug = view.medical_record_view(path.patient_id, True, **params)

    return {
        "medical": [serialize.serialize_medical_record(r) for r in medical],
        "drug": [serialize.serialize_medical_record(r) for r in drug],
    }


# /api/patients/<string:patient_id>/medical_records [POST]
@patient_association_required()
@api_patients.post(
    "/<string:patient_id>/medical_records",
    tags=[medical_records_tag],
    responses={201: MedicalRecordModel},
)
def create_medical_record(path: PatientIdPath, body: MedicalRecordModel):
    """Create Medical Record"""
    if body.id is not None:
        if crud.read(MedicalRecordOrm, id=body.id) is not None:
            return abort(
                409,
                description=f"A medical record with ID {body.id} already exists.",
            )
    if body.patient_id is not None:
        if body.patient_id != path.patient_id:
            return abort(400, description="Patient IDs must match.")
    else:
        body.patient_id = path.patient_id
    new_medical_record = body.model_dump()
    new_record = marshal.unmarshal(MedicalRecordOrm, new_medical_record)

    crud.create(new_record, refresh=True)

    return marshal.marshal(new_record), 201


# /api/patients/<string:patient_id>/drug_history [PUT]
@patient_association_required()
@api_patients.put(
    "/<string:patient_id>/drug_history",
    tags=[medical_records_tag],
    responses={200: MedicalRecordModel},
)
def update_patient_drug_history(path: PatientIdPath, body: DrugHistory):
    """Update Patient Drug History"""
    drug_history = body.model_dump()
    drug_history = _process_medical_history(drug_history)
    drug_history["patient_id"] = path.patient_id
    new_record = marshal.unmarshal(MedicalRecordOrm, drug_history)

    crud.create(new_record, refresh=True)

    return marshal.marshal(new_record), 201


# /api/medical_records
api_medical_records = APIBlueprint(
    name="medical_records",
    import_name=__name__,
    url_prefix="/medical_records",
    abp_tags=[medical_records_tag],
    abp_security=[{"jwt": []}],
)


# /api/medical_records/<string:record_id> [GET]
@api_medical_records.get("/<string:record_id>", responses={200: MedicalRecordModel})
def get_medical_record(path: RecordIdPath):
    """Get Medical Record"""
    record = _get_medical_record(path.record_id)
    return marshal.marshal(record)


# /api/medical_records/<string:record_id> [PUT]
@api_medical_records.put("/<string:record_id>", responses={200: MedicalRecordModel})
def update_medical_record(path: RecordIdPath, body: MedicalRecordModel):
    """Update Medical Record"""
    update_medical_record = body.model_dump()

    old_record = crud.read(MedicalRecordOrm, id=path.record_id)
    if old_record is None:
        return abort(404, description=f"No Medical Record with ID: {path.record_id}")

    if body.patient_id != old_record.patient_id:
        return abort(400, description="Patient ID cannot be changed.")

    crud.update(MedicalRecordOrm, update_medical_record, id=path.record_id)

    new_record = crud.read(MedicalRecordOrm, id=path.record_id)
    record_dict = marshal.marshal(new_record)
    return record_dict, 200


# /api/medical_records/<string:record_id> [DELETE]
@api_medical_records.delete("/<string:record_id>")
def delete_medical_record(path: RecordIdPath):
    """Delete Medical Record"""
    record = _get_medical_record(path.record_id)
    crud.delete(record)
    return {"message": f"Deleted Medical Record with ID: {path.record_id}"}, 200


def _process_medical_history(request_body):
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
