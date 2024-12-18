import logging
from typing import Any, List, NamedTuple, Union, cast

from flask import request
from flask_restful import Resource, abort
from marshmallow import ValidationError

from common import api_utils, user_utils
from data import crud, db_session, marshal
from models import (
    MedicalRecordOrm,
    PatientAssociationsOrm,
    PatientOrm,
    PregnancyOrm,
    ReadingOrm,
    ReferralOrm,
)
from service import invariant, serialize, view
from validation.readings import ReadingValidator
from validation.referrals import ReferralEntityValidator
from validation.validation_exception import ValidationExceptionError

LOGGER = logging.getLogger(__name__)


class ModelData(NamedTuple):
    key_value: Union[str, int]
    values: dict


# /api/sync/patients
class SyncPatients(Resource):
    @staticmethod
    def post():
        current_user = user_utils.get_current_user_from_jwt()
        last_sync = request.args.get("since", None, type=int)
        if not last_sync:
            abort(400, message="'since' query parameter is required")
            return None

        # Validate and load patients
        mobile_patients = api_utils.get_request_body()
        status_code = 200
        errors: List[dict] = list()
        patients_to_create: List[PatientOrm] = list()
        pregnancies_to_create: List[PregnancyOrm] = list()
        medical_records_to_create: List[MedicalRecordOrm] = list()
        drug_records_to_create: List[MedicalRecordOrm] = list()
        associations_to_create: List[PatientAssociationsOrm] = list()
        patients_to_update: List[ModelData] = list()
        pregnancies_to_update: List[ModelData] = list()
        models_list = [
            patients_to_create,
            pregnancies_to_create,
            medical_records_to_create,
            drug_records_to_create,
            associations_to_create,
            patients_to_update,
            pregnancies_to_update,
        ]
        for mobile_patient in mobile_patients:
            patient_id = mobile_patient.get("id")
            # Loop variables each holding a singular model corresponding to a list in models_list
            patient_to_create = None
            pregnancy_to_create = None
            medical_record_to_create = None
            drug_record_to_create = None
            assessment_to_create = None
            patient_to_update = None
            pregnancy_to_update = None
            try:
                server_patient = crud.read(PatientOrm, id=patient_id)
                if not server_patient:
                    patient_to_create = serialize.deserialize_patient(
                        mobile_patient, shallow=False
                    )
                else:
                    if (
                        mobile_patient.get("last_edited")
                        and mobile_patient["last_edited"] > last_sync
                    ) and (
                        mobile_patient.get("base")
                        and mobile_patient["base"] == server_patient.last_edited
                    ):
                        # Otherwise, patient personal info has been edited on Android or has
                        # been edited on the server; in the latter case personal info on Android
                        # will be overridden if sync succeeds
                        values = serialize.deserialize_patient(
                            mobile_patient, partial=True
                        )
                        patient_to_update = ModelData(patient_id, values)

                    if mobile_patient.get("medical_last_edited"):
                        medical_record_to_create = serialize.deserialize_medical_record(
                            mobile_patient, False
                        )

                    if mobile_patient.get("drug_last_edited"):
                        drug_record_to_create = serialize.deserialize_medical_record(
                            mobile_patient, True
                        )

                    # Variables for checking conflicts with new pregnancy in the next condition block
                    pregnancy_id = None
                    pregnancy_end_date = None
                    if mobile_patient.get("pregnancy_end_date"):
                        values = serialize.deserialize_pregnancy(
                            mobile_patient, partial=True
                        )
                        pregnancy = crud.read(
                            PregnancyOrm, id=mobile_patient.get("pregnancy_id")
                        )
                        if not pregnancy or pregnancy.patient_id != patient_id:
                            err = _to_string("pregnancy_id", "invalid")
                            raise ValidationError(err)
                        pregnancy_id = pregnancy.id
                        pregnancy_end_date = pregnancy.end_date
                        if not pregnancy_end_date:
                            # Otherwise, pregnancy has been edited on server; end date inputted
                            # on Android will be discarded if sync succeeds
                            pregnancy_end_date = values["end_date"]
                            if (
                                pregnancy.start_date >= pregnancy_end_date
                                or crud.has_conflicting_pregnancy_record(
                                    patient_id,
                                    pregnancy.start_date,
                                    pregnancy_end_date,
                                    pregnancy_id,
                                )
                            ):
                                err = _to_string("pregnancy_end_date", "conflict")
                                raise ValidationError(err)
                            pregnancy_to_update = ModelData(pregnancy_id, values)

                    if (
                        mobile_patient.get("pregnancy_start_date")
                        and not mobile_patient.get("pregnancy_id")
                    ) or (
                        mobile_patient.get("pregnancy_start_date")
                        and mobile_patient.get("pregnancy_end_date")
                    ):
                        model = serialize.deserialize_pregnancy(mobile_patient)
                        if (
                            pregnancy_end_date
                            and model.start_date <= pregnancy_end_date
                        ) or crud.has_conflicting_pregnancy_record(
                            patient_id,
                            model.start_date,
                            pregnancy_id=pregnancy_id,
                        ):
                            err = _to_string("pregnancy_start_date", "conflict")
                            raise ValidationError(err)
                        pregnancy_to_create = model

                association = {
                    "patient_id": patient_id,
                    "health_facility_name": current_user.get("health_facility_name"),
                    "user_id": current_user["id"],
                }
                if not crud.read(PatientAssociationsOrm, **association):
                    assessment_to_create = marshal.unmarshal(
                        PatientAssociationsOrm, association
                    )

                # Queue models as validation completes without exceptions
                models = [
                    patient_to_create,
                    pregnancy_to_create,
                    medical_record_to_create,
                    drug_record_to_create,
                    assessment_to_create,
                    patient_to_update,
                    pregnancy_to_update,
                ]
                for m, ms in zip(models, models_list):
                    if m:
                        ms.append(m)
            except ValidationError as err:
                errors.append({"patient_id": patient_id, "errors": str(err)})
                status_code = 207
            except:
                raise

        with db_session.begin_nested():
            # Create and update patients in the database
            for models in models_list[:5]:
                if models:
                    crud.create_all(models, autocommit=False)
            for data in patients_to_update:
                crud.update(
                    PatientOrm,
                    data.values,
                    autocommit=False,
                    id=data.key_value,
                )
            for data in pregnancies_to_update:
                crud.update(
                    PregnancyOrm, data.values, autocommit=False, id=data.key_value
                )

            # Read all patients that have been created or updated since last sync
            current_user = cast(dict[Any, Any], current_user)
            new_patients = view.patient_view(current_user, last_sync)
            patients_json = [serialize.serialize_patient(p) for p in new_patients]
        db_session.commit()

        return {"patients": patients_json, "errors": errors}, status_code


# /api/sync/readings
class SyncReadings(Resource):
    @staticmethod
    def post():
        last_sync = request.args.get("since", None, type=int)
        if last_sync is None:
            abort(400, message="'since' query parameter is required")
            return None

        request_body = api_utils.get_request_body()
        patients_on_server_cache = set()
        for reading_dict in request_body:
            if reading_dict.get("patient_id") not in patients_on_server_cache:
                patient_on_server = crud.read(
                    PatientOrm, id=reading_dict.get("patient_id")
                )
                if patient_on_server is None:
                    continue
                patients_on_server_cache.add(patient_on_server.id)

            if crud.read(ReadingOrm, id=reading_dict.get("id")):
                crud.update(
                    ReadingOrm,
                    {"date_retest_needed": reading_dict.get("date_retest_needed")},
                    id=reading_dict.get("id"),
                )
            else:
                try:
                    ReadingValidator.validate(reading_dict)
                except ValidationExceptionError as e:
                    abort(400, message=str(e))
                    return None
                reading = marshal.unmarshal(ReadingOrm, reading_dict)
                invariant.resolve_reading_invariants(reading)
                crud.create(reading, refresh=True)

        # Read all readings that have been created or updated since last sync
        current_user = user_utils.get_current_user_from_jwt()
        new_readings = view.reading_view(current_user, last_sync)

        return {
            "readings": [serialize.serialize_reading(r) for r in new_readings],
        }


# /api/sync/referrals
class SyncReferrals(Resource):
    @staticmethod
    def post():
        last_sync: int = request.args.get("since", None, type=int)
        if not last_sync:
            abort(400, message="'since' query parameter is required")

        request_body = api_utils.get_request_body()
        patients_on_server_cache = set()
        for referral_dict in request_body:
            if referral_dict.get("patient_id") not in patients_on_server_cache:
                patient_on_server = crud.read(
                    PatientOrm, id=referral_dict.get("patient_id")
                )
                if patient_on_server is None:
                    continue
                patients_on_server_cache.add(patient_on_server.id)

            if crud.read(ReferralOrm, id=referral_dict.get("id")):
                # currently, for referrals that exist in server already we will
                # skip them
                continue
            try:
                ReferralEntityValidator.validate(referral_dict)
            except ValidationExceptionError as e:
                abort(400, message=str(e))
            referral = marshal.unmarshal(ReferralOrm, referral_dict)
            crud.create(referral, refresh=True)

        # Read all referrals that have been created or updated since last sync
        current_user = user_utils.get_current_user_from_jwt()
        new_referrals = view.referral_view(current_user, last_sync)

        return {
            "referrals": [
                serialize.serialize_referral_or_assessment(r) for r in new_referrals
            ],
        }


# /api/sync/assessments
class SyncAssessments(Resource):
    @staticmethod
    def post():
        last_sync: int = request.args.get("since", None, type=int)
        if not last_sync:
            abort(400, message="'since' query parameter is required")

        # Read all assessments that have been updated since last sync
        current_user = user_utils.get_current_user_from_jwt()
        new_assessments = view.assessment_view(current_user, last_sync)

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
