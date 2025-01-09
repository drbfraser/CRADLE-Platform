from datetime import date
from typing import Any, cast

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from pydantic import Field

import data
from api.decorator import patient_association_required, roles_required
from common import user_utils
from common.api_utils import (
    PageLimitFilterQueryParams,
    PatientIdPath,
    SearchFilterQueryParams,
)
from data import crud, marshal
from enums import RoleEnum
from models import (
    AssessmentOrm,
    PatientOrm,
    PregnancyOrm,
    ReadingOrm,
    ReferralOrm,
    UserOrm,
)
from service import assoc, invariant, serialize, statsCalculation, view
from utils import get_current_time
from validation import CradleBaseModel
from validation.assessments import AssessmentPostBody
from validation.patients import PatientPostValidator, PatientPutValidator
from validation.readings import ReadingValidator

patient_not_found_message = "Patient with ID: ({}) not found."


# /api/patients
api_patients = APIBlueprint(
    name="patients",
    import_name=__name__,
    url_prefix="/patients",
    abp_tags=[Tag(name="Patients", description="")],
    abp_security=[{"jwt": []}],
)


# /api/patients [GET]
@api_patients.get("")
def get_all_unarchived_patients(query: SearchFilterQueryParams):
    """
    Get all Unarchived Patients
    Returns all UNARCHIVED Patients associated with the current user.
    """
    current_user = user_utils.get_current_user_from_jwt()
    current_user = cast(dict[Any, Any], current_user)
    params = query.model_dump()
    patients = view.patient_list_view(current_user, **params)
    return serialize.serialize_patient_list(patients)


# /api/patients [POST]
@api_patients.post("")
def create_patient(body: PatientPostValidator):
    """Create New Patient"""
    patient_id = body.id
    if crud.read(PatientOrm, id=patient_id):
        return abort(409, description=f"A patient already exists with ID: {patient_id}")

    new_patient = body.model_dump()
    patient = marshal.unmarshal(PatientOrm, new_patient)

    # Resolve invariants and set the creation timestamp for the patient ensuring
    # that both the created and last_edited fields have the exact same value.
    invariant.resolve_reading_invariants(patient)
    creation_time = get_current_time()
    patient.date_created = creation_time
    patient.last_edited = creation_time
    patient.is_archived = False

    crud.create(patient, refresh=True)

    # Associate the patient with the user who created them
    current_user = user_utils.get_current_user_from_jwt()
    current_user_orm = crud.read(UserOrm, id=current_user["id"])
    assoc.associate_by_user_role(patient, current_user_orm)

    # If the patient has any referrals, associate the patient with the facilities they were referred to
    for referral in patient.referrals:
        if not assoc.has_association(patient, referral.health_facility):
            assoc.associate(patient, facility=referral.health_facility)
            # The associate function performs a database commit, since this will
            # wipe out the patient we want to return we must refresh it.
            data.db_session.refresh(patient)

    return marshal.marshal(patient), 201


# /api/patients/<string:patient_id> [GET]
@patient_association_required()
@api_patients.get("/<string:patient_id>")
def get_patient(path: PatientIdPath):
    """
    Get Patient
    Gets Patient by their ID.
    Returns Patient info with nested Readings, Referrals, and Assessments.
    """
    patient = crud.read_patients(path.patient_id)
    if patient is None:
        return abort(404, description=patient_not_found_message.format(path.patient_id))

    readings = crud.read_readings(path.patient_id)
    referrals = crud.read_referrals_or_assessments(ReferralOrm, path.patient_id)
    assessments = crud.read_referrals_or_assessments(AssessmentOrm, path.patient_id)

    return serialize.serialize_patient(patient, readings, referrals, assessments)


# /api/patients/<string:patient_id>/info [GET]
@patient_association_required()
@api_patients.get("/<string:patient_id>/info")
def get_patient_info(path: PatientIdPath):
    """Get Patient Info"""
    patient = crud.read(PatientOrm, id=path.patient_id)
    if not patient:
        return abort(404, description=patient_not_found_message.format(path.patient_id))
    return marshal.marshal(patient, shallow=True)


# /api/patients/<string:patient_id>/info [PUT]
@api_patients.put("/<string:patient_id>/info")
def update_patient_info(path: PatientIdPath, body: PatientPutValidator):
    """Update Patient Info"""
    update_patient = body.model_dump()
    # If the inbound JSON contains a `base` field then we need to check if it is the
    # same as the `last_edited` field of the existing patient. If it is then that
    # means that the patient has not been edited on the server since this inbound
    # patient was last synced and we can apply the changes. If they are not equal,
    # then that means the patient has been edited on the server after it was last
    # synced with the client. In these cases, we reject the changes for the client.
    #
    # You can think of this like aborting a git merge due to conflicts.
    base = body.base
    if base:
        patient = crud.read(PatientOrm, id=path.patient_id)
        if patient is None:
            return abort(
                404, description=patient_not_found_message.format(path.patient_id)
            )
        last_edited = patient.last_edited
        if base != last_edited:
            return abort(409, description="Unable to merge changes, conflict detected")

        # Delete the `base` field once we are done with it as to not confuse the
        # ORM as there is no "base" column in the database for patients.
        del update_patient["base"]

    crud.update(PatientOrm, update_patient, id=path.patient_id)
    patient = crud.read(PatientOrm, id=path.patient_id)
    if patient is None:
        return abort(404, description=patient_not_found_message.format(path.patient_id))

    # Update the patient's last_edited timestamp only if there was no `base` field
    # in the request JSON. If there was then that means that this edit happened some
    # time in the past and is just being synced. In this case we want to keep the
    # `last_edited` value which is present in the request.
    if not base:
        patient.last_edited = get_current_time()
        data.db_session.commit()
        data.db_session.refresh(patient)  # Need to refresh the patient after commit

    return marshal.marshal(patient)


# /api/patients/<string:patient_id>/stats [GET]
@patient_association_required()
@api_patients.get("/<string:patient_id>/stats")
def get_patient_stats(path: PatientIdPath):
    """Get Patient Stats"""
    patient = crud.read(PatientOrm, id=path.patient_id)
    if patient is None:
        return abort(404, description=patient_not_found_message.format(path.patient_id))

    today = date.today()
    current_year = today.year
    current_month = today.month

    # getting all systolic_blood_pressure readings for each month
    bp_systolic = statsCalculation.get_stats_data(
        "systolic_blood_pressure",
        patient.readings,
        current_year,
        current_month,
    )

    # getting all bpDiastolic readings for each month
    bp_diastolic = statsCalculation.get_stats_data(
        "diastolic_blood_pressure",
        patient.readings,
        current_year,
        current_month,
    )

    # getting all heart rate readings for each month
    heart_rate = statsCalculation.get_stats_data(
        "heart_rate",
        patient.readings,
        current_year,
        current_month,
    )

    # getting all bpSystolic readings for each month dated from 12 months before the current month
    bp_systolic_last_twelve_months = statsCalculation.get_stats_data(
        "bp_systolic_last_twelve_months",
        patient.readings,
        current_year,
        current_month,
        True,
    )

    # getting all bpDiastolic readings for each month dated from 12 months before the current month
    bp_diastolic_last_twelve_months = statsCalculation.get_stats_data(
        "bp_diastolic_last_twelve_months",
        patient.readings,
        current_year,
        current_month,
        True,
    )

    # getting all heart rate readings for each month dated from 12 months before the current month
    heart_rate_last_twelve_months = statsCalculation.get_stats_data(
        "heart_rate_last_twelve_months",
        patient.readings,
        current_year,
        current_month,
        True,
    )

    # getting all traffic lights from day 1 for this patient
    traffic_light_statuses = statsCalculation.get_stats_data(
        "traffic_light_status",
        patient.readings,
        current_year,
        current_month,
    )

    # putting data into one object now
    data = {
        "bp_systolic_readings_monthly": bp_systolic,
        "bp_diastolic_readings_monthly": bp_diastolic,
        "heart_rate_readings_monthly": heart_rate,
        "bp_systolic_readings_last_twelve_months": bp_systolic_last_twelve_months,
        "bp_diastolic_readings_last_twelve_months": bp_diastolic_last_twelve_months,
        "heart_rate_readings_last_twelve_months": heart_rate_last_twelve_months,
        "traffic_light_counts_from_day_1": {
            "green": traffic_light_statuses[0],
            "yellow_up": traffic_light_statuses[1],
            "yellow_down": traffic_light_statuses[2],
            "red_up": traffic_light_statuses[3],
            "red_down": traffic_light_statuses[4],
        },
        "current_month": current_month,
    }
    return data


# /api/patients/<string:patient_id>/readings
@api_patients.get("/<string:patient_id>/readings")
def get_patient_readings(path: PatientIdPath):
    """Get Patient's Readings"""
    patient = crud.read(PatientOrm, id=path.patient_id)
    if patient is None:
        return abort(404, description=patient_not_found_message.format(path.patient_id))
    return [marshal.marshal(r) for r in patient.readings]


# /api/patients/<string:patient_id>/most_recent_reading [GET]
@api_patients.get("/<string:patient_id>/most_recent_reading")
def get_patient_most_recent_reading(path: PatientIdPath):
    """Get Patient's Most Recent Reading"""
    patient = crud.read(PatientOrm, id=path.patient_id)
    if patient is None:
        return abort(404, description=patient_not_found_message.format(path.patient_id))
    readings = [marshal.marshal(r) for r in patient.readings]
    if len(readings) == 0:
        return []

    sorted_readings = sorted(
        readings,
        key=lambda r: r["date_taken"],
        reverse=True,
    )
    return [sorted_readings[0]]


# /api/patients/<string:patient_id>/referrals [GET]
@api_patients.get("/<string:patient_id>/referrals")
def get_patient_referrals(path: PatientIdPath):
    """Get Patient's Referrals"""
    patient = crud.read(PatientOrm, id=path.patient_id)
    if patient is None:
        return abort(404, description=patient_not_found_message.format(path.patient_id))
    return [marshal.marshal(ref) for ref in patient.referrals]


# /api/patients/<string:patient_id>/forms [GET]
@api_patients.get("/<string:patient_id>/forms")
def get_patient_forms(path: PatientIdPath):
    """Get Patient's Forms"""
    patient = crud.read(PatientOrm, id=path.patient_id)
    if patient is None:
        return abort(404, description=patient_not_found_message.format(path.patient_id))
    return [marshal.marshal(form, True) for form in patient.forms]


# /api/patients/<string:patient_id>/pregnancy_summary [GET]
@patient_association_required()
@api_patients.get("/<string:patient_id>/pregnancy_summary")
def get_patient_pregnancy_summary(path: PatientIdPath):
    """Get Patient Summary"""
    pregnancies = crud.read_medical_records(
        PregnancyOrm, path.patient_id, direction="DESC"
    )
    return marshal.marshal_patient_pregnancy_summary(pregnancies)


# /api/patients/<string:patient_id>/medical_history [GET]
@patient_association_required()
@api_patients.get("/<string:patient_id>/medical_history")
def get_patient_medical_history(path: PatientIdPath):
    """Get Patient Medical History"""
    medical = crud.read_patient_current_medical_record(path.patient_id, False)
    drug = crud.read_patient_current_medical_record(path.patient_id, True)
    return marshal.marshal_patient_medical_history(medical=medical, drug=drug)


# /api/patients/<string:patient_id>/timeline [GET]
@patient_association_required()
@api_patients.get("/<string:patient_id>/timeline")
def get_patient_timeline(path: PatientIdPath, query: PageLimitFilterQueryParams):
    """Get Patient Timeline"""
    params = query.model_dump()
    records = crud.read_patient_timeline(path.patient_id, **params)
    return [serialize.serialize_patient_timeline(r) for r in records]


class CreateReadingWithAssessmentBody(CradleBaseModel):
    reading: ReadingValidator
    assessment: AssessmentPostBody


# /api/patients/reading-assessment [POST]
@api_patients.post("/patients/reading-assessment")
def create_reading_with_assessment(body: CreateReadingWithAssessmentBody):
    """Create Reading With Assessment"""
    # TODO: This endpoint should probably be moved to readings.py
    reading = body.reading
    assessment = body.assessment

    current_user = user_utils.get_current_user_from_jwt()
    user_id = current_user["id"]
    reading.user_id = user_id
    assessment.healthcare_worker_id = user_id

    new_reading = marshal.unmarshal(ReadingOrm, reading.model_dump())

    if crud.read(ReadingOrm, id=new_reading.id):
        return abort(409, description=f"A reading already exists with id: {reading.id}")

    invariant.resolve_reading_invariants(new_reading)

    new_assessment = marshal.unmarshal(AssessmentOrm, assessment.model_dump())

    crud.create(new_reading, refresh=True)
    crud.create(new_assessment)

    response_body = {
        "reading": marshal.marshal(reading),
        "assessment": marshal.marshal(assessment),
    }

    return response_body, 201


class GetAllRecordsForPatientQueryParams(CradleBaseModel):
    assessments: bool = Field(
        True, description="If true, assessments will be included."
    )
    readings: bool = Field(True, description="If true, readings will be included.")
    referrals: bool = Field(True, description="If true, referrals will be included.")


# /api/patients/<string:patient_id>/get_all_records [GET]
@api_patients.get("/<string:patient_id>/get_all_records")
def get_all_records_for_patient(
    path: PatientIdPath, query: GetAllRecordsForPatientQueryParams
):
    """Get All Records for Patient"""
    params = query.model_dump()
    records = crud.read_patient_all_records(path.patient_id, **params)
    return [marshal.marshal_with_type(r) for r in records]


# /api/patients/admin
@api_patients.get("/admin")
@roles_required([RoleEnum.ADMIN])
def get_all_patients_admin(query: SearchFilterQueryParams):
    """
    Get All Patients (Admin)
    Gets ALL patients, including archived, regardless of association with
    current user. For admin use.
    """
    current_user = user_utils.get_current_user_from_jwt()
    current_user = cast(dict[Any, Any], current_user)
    params = query.model_dump()
    patients = view.admin_patient_view(current_user, **params)
    return serialize.serialize_patients_admin(patients)
