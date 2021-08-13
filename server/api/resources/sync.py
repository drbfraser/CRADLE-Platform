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
from models import MedicalRecord, Patient, PatientAssociations, Pregnancy, Reading
import service.invariant as invariant
import data.crud as crud


class ModelData(NamedTuple):
    key_value: Union[str, int]
    values: dict


# /api/sync/patients
class SyncPatients(Resource):
    @staticmethod
    @jwt_required
    def post():
        user = get_jwt_identity()
        last_sync = request.args.get("since", None, type=int)
        if not last_sync:
            abort(400, message="'since' query parameter is required")

        # Validate and load patients
        mobile_patients = request.get_json(force=True)
        patients_to_create: List[Patient] = list()
        pregnancies_to_create: List[Pregnancy] = list()
        records_to_create: List[MedicalRecord] = list()
        associations_to_create: List[PatientAssociations] = list()
        patients_to_update: List[ModelData] = list()
        pregnancies_to_update: List[ModelData] = list()
        patients_not_synced: List[dict] = list()
        status_code = 200
        for p in mobile_patients:
            patient_id = p.get("patientId")
            try:
                server_patient = crud.read(Patient, patientId=patient_id)
                if not server_patient:
                    patient = serialize.deserialize_patient(p, shallow=False)
                    patients_to_create.append(patient)
                else:
                    if (p.get("lastEdited") and p["lastEdited"] > last_sync) and (
                        p.get("base") and p["base"] == server_patient.lastEdited
                    ):
                        # Otherwise, patient personal info has been edited on Android or has
                        # been edited on the server; in the latter case personal info on Android
                        # will be overridden if sync succeeds
                        values = serialize.deserialize_patient(p, partial=True)
                        patients_to_update.append(ModelData(patient_id, values))

                    if p.get("medicalLastEdited"):
                        model = serialize.deserialize_medical_record(p, False)
                        records_to_create.append(model)

                    if p.get("drugLastEdited"):
                        model = serialize.deserialize_medical_record(p, True)
                        records_to_create.append(model)

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
                                pregnancies_to_update.append(
                                    ModelData(pregnancy_id, values)
                                )

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
                            pregnancies_to_create.append(model)

                association = {
                    "patientId": patient_id,
                    "healthFacilityName": user.get("healthFacilityName"),
                    "userId": user["userId"],
                }
                if not crud.read(PatientAssociations, **association):
                    model = marshal.unmarshal(PatientAssociations, association)
                    associations_to_create.append(model)
            except ValidationError as err:
                patients_not_synced.append({"patientId": patient_id, "error": str(err)})
                status_code = 207
            except:
                raise

        with db_session.begin_nested():
            # Create and update patients in the database
            models_list = [
                patients_to_create,
                pregnancies_to_create,
                records_to_create,
                associations_to_create,
            ]
            for models in models_list:
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

        return {
            "total": len(new_patients),
            "patients": patients_json,
            "patientsNotSynced": patients_not_synced,
        }, status_code


# /api/sync/readings
class SyncReadings(Resource):
    @staticmethod
    @jwt_required
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

        # Read all readings, referrals and folllowups that have been created or updated since last sync
        user = get_jwt_identity()
        new_readings = view.reading_view(user, last_sync)
        new_referrals = view.referral_view(user, last_sync)
        new_folllowups = view.assessment_view(user, last_sync)

        return {
            "total": len(new_readings) + len(new_referrals) + len(new_folllowups),
            "readings": [serialize.serialize_reading(r) for r in new_readings],
            "newReferralsForOldReadings": [marshal.marshal(r) for r in new_referrals],
            "newFollowupsForOldReadings": [marshal.marshal(a) for a in new_folllowups],
        }


ERROR_MESSAGES = {
    "conflict": "Pregnancy conflicts with existing records.",
    "invalid": "Value is invalid.",
}


def _to_string(field, error):
    # marshmallow.ValidationError error message style
    return "{'" + field + "': ['" + ERROR_MESSAGES[error] + "']}"
