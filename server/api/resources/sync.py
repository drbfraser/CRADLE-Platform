from typing import List
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource, abort

import api.util as util
import service.view as view
import service.serialize as serialize
import data.marshal as marshal
from data import db_session
from data.crud import ModelData
from validation.patients import validate as validate_patient
from validation.readings import validate as validate_reading
from models import MedicalRecord, Patient, PatientAssociations, Pregnancy, Reading
from utils import get_current_time
import service.invariant as invariant
import service.assoc as assoc
import data.crud as crud


# /api/sync/patients
class UpdatesPatients(Resource):
    @staticmethod
    @jwt_required
    def post():
        user = get_jwt_identity()
        last_sync = request.args.get("since", None, type=int)
        if not last_sync:
            abort(400, message="'since' query parameter is required")

        mobile_patients = request.get_json(force=True)
        patients_to_create: List[Patient] = list()
        pregnancies_to_create: List[Pregnancy] = list()
        records_to_create: List[MedicalRecord] = list()
        associations_to_create: List[PatientAssociations] = list()
        patients_to_update: List[ModelData] = list()
        pregnancies_to_update: List[ModelData] = list()
        for p in mobile_patients:
            patient_id = p["patientId"]
            server_patient = crud.read(Patient, patientId=patient_id)
            if not server_patient:
                patient = serialize.deserialize_patient(p, shallow=False)
                patients_to_create.append(patient)
            else:
                if p.get("base") and p["base"] == server_patient.lastEdited:
                    values = serialize.deserialize_patient(p, partial=True)
                    patients_to_update.append(ModelData(patient_id, values))

                if p.get("medicalLastEditedDate"):
                    model = serialize.deserialize_medical_record(p, False)
                    records_to_create.append(model)

                if p.get("drugLastEditedDate"):
                    model = serialize.deserialize_medical_record(p, True)
                    records_to_create.append(model)

                pregnancy_id = None
                pregnancy_end_date = None
                if p.get("pregnancyEndDate"):
                    pregnancy = crud.read(Pregnancy, id=p["pregnancyId"])
                    pregnancy_id = pregnancy.id
                    pregnancy_end_date = pregnancy.endDate
                    if not pregnancy_end_date:
                        pregnancy_end_date = p["pregnancyEndDate"]
                        if crud.has_conflicting_pregnancy_record(
                            patient_id,
                            pregnancy.startDate,
                            p["pregnancyEndDate"],
                            pregnancy_id,
                        ):
                            abort(409, message="")
                        else:
                            values = serialize.deserialize_pregnancy(p, partial=True)
                            pregnancies_to_update.append(
                                ModelData(pregnancy_id, values)
                            )

                if (p.get("pregnancyStartDate") and not p.get("pregnancyId")) or (
                    p.get("pregnancyStartDate") and p.get("pregnancyEndDate")
                ):
                    if crud.has_conflicting_pregnancy_record(
                        patient_id, p["pregnancyStartDate"], pregnancy_id=pregnancy_id
                    ) or (
                        pregnancy_end_date
                        and p["pregnancyStartDate"] <= pregnancy_end_date
                    ):
                        abort(409, message="")
                    else:
                        model = serialize.deserialize_pregnancy(p)
                        pregnancies_to_create.append(model)

            association = {
                "patientId": patient_id,
                "healthFacilityName": user.get("healthFacilityName"),
                "userId": user["userId"],
            }
            if not crud.read(PatientAssociations, **association):
                model = marshal.unmarshal(PatientAssociations, association)
                associations_to_create.append(model)

        models_list = [
            patients_to_create,
            pregnancies_to_create,
            records_to_create,
            associations_to_create,
        ]
        for models in models_list:
            if models:
                crud.create_all(models)
        for p in patients_to_update:
            crud.update_by(Patient, p, Patient.patientId)
        for p in pregnancies_to_update:
            crud.update_by(Pregnancy, p, Pregnancy.id)

        # Read all patients that have been created or updated since last sync
        new_patients = view.patient_view(user, last_sync)

        return {
            "total": len(new_patients),
            "patients": [serialize.serialize_patient(p) for p in new_patients],
        }


# /api/sync/readings
class UpdatesReadings(Resource):
    @staticmethod
    @jwt_required
    def post():
        # Get all patients for this user
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

        # Read all readings, referrals and asseessments that have been created or updated since last sync
        user = get_jwt_identity()
        new_readings = view.reading_view(user, last_sync)
        new_referrals = view.referral_view(user, last_sync)
        new_assessments = view.assessment_view(user, last_sync)

        return {
            "total": len(new_readings) + len(new_referrals) + len(new_assessments),
            "readings": [serialize.serialize_reading(r) for r in new_readings],
            "newReferralsForOldReadings": [marshal.marshal(r) for r in new_referrals],
            "newFollowupsForOldReadings": [marshal.marshal(a) for a in new_assessments],
        }
