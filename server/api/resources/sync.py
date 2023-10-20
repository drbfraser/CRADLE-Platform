from distutils.log import error
from typing import List, NamedTuple, Union
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource, abort
from marshmallow import ValidationError

import service.view as view
import service.serialize as serialize
import data.marshal as marshal
from data import db_session
from validation.readings import validate as validate_reading
from validation.referrals import validate as validate_referral
from models import (
    MedicalRecord,
    Patient,
    PatientAssociations,
    Pregnancy,
    Reading,
    Referral,
    FollowUp,
)
import service.invariant as invariant
import data.crud as crud


class ModelData(NamedTuple):
    key_value: Union[str, int]
    values: dict


# /api/sync/patients
class SyncPatients(Resource):
    @staticmethod
    @jwt_required()
    def post():
        user = get_jwt_identity()
        last_sync = request.args.get("since", None, type=int)
        if not last_sync:
            abort(400, message="'since' query parameter is required")

        # Validate and load patients
        mobile_patients = request.get_json(force=True)
        status_code = 200
        errors: List[dict] = list()
        patients_to_create: List[Patient] = list()
        pregnancies_to_create: List[Pregnancy] = list()
        mrecords_to_create: List[MedicalRecord] = list()
        drecords_to_create: List[MedicalRecord] = list()
        associations_to_create: List[PatientAssociations] = list()
        patients_to_update: List[ModelData] = list()
        pregnancies_to_update: List[ModelData] = list()
        models_list = [
            patients_to_create,
            pregnancies_to_create,
            mrecords_to_create,
            drecords_to_create,
            associations_to_create,
            patients_to_update,
            pregnancies_to_update,
        ]
        for p in mobile_patients:
            patient_id = p.get("patientId")
            # Loop variables each holding a singular model corresponding to a list in models_list
            pt_crt = None
            pr_crt = None
            mrc_crt = None
            drc_crt = None
            as_crt = None
            pt_upd = None
            pr_upd = None
            server_patient = crud.read(Patient, patientId=patient_id)
            if not server_patient:
                pt_crt = serialize.deserialize_patient(p, shallow=False)
            else:
                if (p.get("lastEdited") and p["lastEdited"] > last_sync) and (
                    p.get("base") and p["base"] == server_patient.lastEdited
                ):
                    # Otherwise, patient personal info has been edited on Android or has
                    # been edited on the server; in the latter case personal info on Android
                    # will be overridden if sync succeeds
                    values = serialize.deserialize_patient(p, partial=True)
                    pt_upd = ModelData(patient_id, values)

                if p.get("medicalLastEdited"):
                    mrc_crt = serialize.deserialize_medical_record(p, False)

                if p.get("drugLastEdited"):
                    drc_crt = serialize.deserialize_medical_record(p, True)

                # Variables for checking conflicts with new pregnancy in the next condition block
                pregnancy_id = None
                pregnancy_end_date = None
                if p.get("pregnancyEndDate"):
                    values = serialize.deserialize_pregnancy(p, partial=True)
                    pregnancy = crud.read(Pregnancy, id=p.get("pregnancyId"))
                    if not pregnancy or pregnancy.patientId != patient_id:
                        err = _to_string("pregnancyId", "invalid")
                        raise ValidationError(err)
                    pregnancy_id = pregnancy.id
                    pregnancy_end_date = pregnancy.endDate
                    if not pregnancy_end_date:
                        # Otherwise, pregnancy has been edited on server; end date inputted
                        # on Android will be discarded if sync succeeds
                        pregnancy_end_date = values["endDate"]
                        if (
                            pregnancy.startDate >= pregnancy_end_date
                            or crud.has_conflicting_pregnancy_record(
                                patient_id,
                                pregnancy.startDate,
                                pregnancy_end_date,
                                pregnancy_id,
                            )
                        ):
                            err = _to_string("pregnancyEndDate", "conflict")
                            raise ValidationError(err)
                        else:
                            pr_upd = ModelData(pregnancy_id, values)

                if (p.get("pregnancyStartDate") and not p.get("pregnancyId")) or (
                    p.get("pregnancyStartDate") and p.get("pregnancyEndDate")
                ):
                    model = serialize.deserialize_pregnancy(p)
                    if (
                        pregnancy_end_date and model.startDate <= pregnancy_end_date
                    ) or crud.has_conflicting_pregnancy_record(
                        patient_id, model.startDate, pregnancy_id=pregnancy_id
                    ):
                        err = _to_string("pregnancyStartDate", "conflict")
                        raise ValidationError(err)
                    else:
                        pr_crt = model

            association = {
                "patientId": patient_id,
                "healthFacilityName": user.get("healthFacilityName"),
                "userId": user["userId"],
            }
            if not crud.read(PatientAssociations, **association):
                as_crt = marshal.unmarshal(PatientAssociations, association)

            # Queue models as validation completes without exceptions
            models = [pt_crt, pr_crt, mrc_crt, drc_crt, as_crt, pt_upd, pr_upd]
            for m, ms in zip(models, models_list):
                if m:
                    ms.append(m)
        

        with db_session.begin_nested():
            # Create and update patients in the database
            for models in models_list[:5]:
                if models:
                    crud.create_all(models, autocommit=False)
            for data in patients_to_update:
                crud.update(
                    Patient, data.values, autocommit=False, patientId=data.key_value
                )
            for data in pregnancies_to_update:
                crud.update(Pregnancy, data.values, autocommit=False, id=data.key_value)

            # Read all patients that have been created or updated since last sync
            new_patients = view.patient_view(user, last_sync)
            patients_json = [serialize.serialize_patient(p) for p in new_patients]
        db_session.commit()

        return {"patients": patients_json, "errors": errors}, status_code


# /api/sync/readings
class SyncReadings(Resource):
    @staticmethod
    @jwt_required()
    def post():
        last_sync: int = request.args.get("since", None, type=int)
        if not last_sync:
            abort(400, message="'since' query parameter is required")

        json = request.get_json(force=True)
        patients_on_server_cache = set()
        for r in json:
            if r.get("patientId") not in patients_on_server_cache:
                patient_on_server = crud.read(Patient, patientId=r.get("patientId"))
                if patient_on_server is None:
                    continue
                else:
                    patients_on_server_cache.add(patient_on_server.patientId)

            if crud.read(Reading, readingId=r.get("readingId")):
                crud.update(
                    Reading,
                    {"dateRecheckVitalsNeeded": r.get("dateRecheckVitalsNeeded")},
                    readingId=r.get("readingId"),
                )
            else:
                error_message = validate_reading(r)
                if error_message is not None:
                    abort(400, message=error_message)
                reading = marshal.unmarshal(Reading, r)
                invariant.resolve_reading_invariants(reading)
                crud.create(reading, refresh=True)

        # Read all readings that have been created or updated since last sync
        user = get_jwt_identity()
        new_readings = view.reading_view(user, last_sync)

        return {
            "readings": [serialize.serialize_reading(r) for r in new_readings],
        }


# /api/sync/referrals
class SyncReferrals(Resource):
    @staticmethod
    @jwt_required()
    def post():
        last_sync: int = request.args.get("since", None, type=int)
        if not last_sync:
            abort(400, message="'since' query parameter is required")

        json = request.get_json(force=True)
        patients_on_server_cache = set()
        for r in json:
            if r.get("patientId") not in patients_on_server_cache:
                patient_on_server = crud.read(Patient, patientId=r.get("patientId"))
                if patient_on_server is None:
                    continue
                else:
                    patients_on_server_cache.add(patient_on_server.patientId)

            if crud.read(Referral, id=r.get("id")):
                # currently, for referrals that exist in server already we will
                # skip them
                continue
            else:
                error_message = validate_referral(r)
                if error_message is not None:
                    abort(400, mesage=error_message)
                referral = marshal.unmarshal(Referral, r)
                crud.create(referral, refresh=True)

        # Read all referrals that have been created or updated since last sync
        user = get_jwt_identity()
        new_referrals = view.referral_view(user, last_sync)

        return {
            "referrals": [
                serialize.serialize_referral_or_assessment(r) for r in new_referrals
            ],
        }


# /api/sync/assessments
class SyncAssessments(Resource):
    @staticmethod
    @jwt_required()
    def post():
        last_sync: int = request.args.get("since", None, type=int)
        if not last_sync:
            abort(400, message="'since' query parameter is required")

        # Read all assessments that have been updated since last sync
        user = get_jwt_identity()
        new_assessments = view.assessment_view(user, last_sync)

        return {
            "assessments": [
                serialize.serialize_referral_or_assessment(a) for a in new_assessments
            ],
        }


ERROR_MESSAGES = {
    "conflict": "Pregnancy conflicts with existing records.",
    "invalid": "Value is invalid.",
}


def _to_string(field, errors):
    # marshmallow.ValidationError error message format
    # A JSON object with 'field' as key and an array of 'errors' as value
    return "{'" + field + "': ['" + ERROR_MESSAGES[errors] + "']}"
