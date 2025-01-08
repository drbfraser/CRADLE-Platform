import logging
from typing import Any, List, NamedTuple, Union, cast

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from marshmallow import ValidationError
from pydantic import Field

from common import user_utils
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
from validation import CradleBaseModel
from validation.patients import PatientSyncValidator
from validation.readings import ReadingValidator
from validation.referrals import ReferralEntityValidator

LOGGER = logging.getLogger(__name__)

# /api/sync
api_sync = APIBlueprint(
    name="sync",
    import_name=__name__,
    url_prefix="/sync",
    abp_tags=[Tag(name="Sync", description="")],
    abp_security=[{"jwt": []}],
)


class ModelData(NamedTuple):
    key_value: Union[str, int]
    values: dict


class LastSyncQueryParam(CradleBaseModel):
    since: int = Field(..., description="Timestamp of last sync.")


class SyncPatientsBody(CradleBaseModel):
    patients: List[PatientSyncValidator]


class SyncReadingsBody(CradleBaseModel):
    readings: List[ReadingValidator]


class SyncReferralsBody(CradleBaseModel):
    referrals: List[ReferralEntityValidator]


# /api/sync/patients [POST]
@api_sync.post("/patients")
def sync_patients(query: LastSyncQueryParam, body: SyncPatientsBody):
    """Sync Patients"""
    current_user = user_utils.get_current_user_from_jwt()
    last_sync = query.since

    mobile_patients = body.patients
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
        patient_id = mobile_patient.id
        # Loop variables each holding a singular model corresponding to a list in models_list
        patient_to_create = None
        pregnancy_to_create = None
        medical_record_to_create = None
        drug_record_to_create = None
        assessment_to_create = None
        patient_to_update = None
        pregnancy_to_update = None
        mobile_patient_dict = mobile_patient.model_dump()
        try:
            server_patient = crud.read(PatientOrm, id=patient_id)
            if server_patient is None:
                """ 
                TODO: Why are these functions called `deserialize`? 
                TODO: Why aren't the marshal/unmarshal functions being used??
                TODO: Why does it return a dict or a database model???
                TODO: WHY DO PEOPLE NOT TYPE ANNOTATE THEIR FUNCTIONS PROPERLY????
                """
                patient_to_create = serialize.deserialize_patient(
                    mobile_patient_dict, shallow=False
                )
            else:
                if (
                    mobile_patient_dict.get("last_edited") is not None
                    and mobile_patient_dict["last_edited"] > last_sync
                ) and (
                    mobile_patient_dict.get("base") is not None
                    and mobile_patient_dict["base"] == server_patient.last_edited
                ):
                    # Otherwise, patient personal info has been edited on Android or has
                    # been edited on the server; in the latter case personal info on Android
                    # will be overridden if sync succeeds
                    values = serialize.deserialize_patient(
                        mobile_patient_dict, partial=True
                    )
                    patient_to_update = ModelData(patient_id, values)

                if mobile_patient_dict.get("medical_last_edited") is not None:
                    medical_record_to_create = serialize.deserialize_medical_record(
                        mobile_patient_dict, False
                    )

                if mobile_patient_dict.get("drug_last_edited") is not None:
                    drug_record_to_create = serialize.deserialize_medical_record(
                        mobile_patient_dict, True
                    )

                # Variables for checking conflicts with new pregnancy in the next condition block
                pregnancy_id = None
                pregnancy_end_date = None
                if mobile_patient_dict.get("pregnancy_end_date") is not None:
                    """
                    TODO: Why is this a dict or a Pregnancy ORM model?
                    Why is it just called 'values' and not something more descriptive?
                    This entire file needs to be massively refactored. 
                    """
                    values = serialize.deserialize_pregnancy(
                        mobile_patient_dict, partial=True
                    )
                    pregnancy = crud.read(
                        PregnancyOrm, id=mobile_patient_dict.get("pregnancy_id")
                    )
                    if pregnancy is None or pregnancy.patient_id != patient_id:
                        err = _to_string("pregnancy_id", "invalid")
                        raise ValidationError(err)
                    pregnancy_id = pregnancy.id
                    pregnancy_end_date = pregnancy.end_date
                    if pregnancy_end_date is None:
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
                    mobile_patient_dict.get("pregnancy_start_date") is not None
                    and mobile_patient_dict.get("pregnancy_id") is None
                ) or (
                    mobile_patient_dict.get("pregnancy_start_date") is not None
                    and mobile_patient_dict.get("pregnancy_end_date") is not None
                ):
                    # TODO: PLEASE GIVE MEANINGFUL NAMES TO YOUR VARIABLES!!!
                    # TODO: DON'T NAME THEM "model" or "values"
                    model = serialize.deserialize_pregnancy(mobile_patient_dict)

                    if (
                        pregnancy_end_date and model.start_date <= pregnancy_end_date
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
            # Why is a PatientAssociation being assigned to a variable called
            # assessment_to_create
            if crud.read(PatientAssociationsOrm, **association) is None:
                assessment_to_create = marshal.unmarshal(
                    PatientAssociationsOrm, association
                )

            # Queue models as validation completes without exceptions
            # Why is it being done like this? This seems needlessly convoluted.
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
        except Exception as err:
            errors.append({"patient_id": patient_id, "errors": str(err)})
            print(str(err))
            status_code = 207

    with db_session.begin_nested():
        # Create and update patients in the database
        for models in models_list[:5]:
            if models:
                crud.create_all(models, autocommit=False)
        for data in patients_to_update:
            print("data:")
            print(data)
            crud.update(
                PatientOrm,
                data.values,
                autocommit=False,
                id=data.key_value,
            )
        for data in pregnancies_to_update:
            crud.update(PregnancyOrm, data.values, autocommit=False, id=data.key_value)
    db_session.commit()

    # Read all patients that have been created or updated since last sync
    current_user = cast(dict[Any, Any], current_user)
    new_patients = view.patient_view(current_user, last_sync)
    patients_json = [serialize.serialize_patient(p) for p in new_patients]

    return {"patients": patients_json, "errors": errors}, status_code


# /api/sync/readings [POST]
@api_sync.post("/readings")
def sync_readings(query: LastSyncQueryParam, body: SyncReadingsBody):
    """Sync Readings"""
    last_sync = query.since
    patients_on_server_cache = set()
    for mobile_reading in body.readings:
        mobile_reading_dict = mobile_reading.model_dump()
        if mobile_reading_dict.get("patient_id") not in patients_on_server_cache:
            patient_on_server = crud.read(
                PatientOrm, id=mobile_reading_dict.get("patient_id")
            )
            if patient_on_server is None:
                continue
            patients_on_server_cache.add(patient_on_server.id)

        if crud.read(ReadingOrm, id=mobile_reading_dict.get("id")):
            crud.update(
                ReadingOrm,
                {"date_retest_needed": mobile_reading_dict.get("date_retest_needed")},
                id=mobile_reading_dict.get("id"),
            )
        else:
            try:
                ReadingValidator(**mobile_reading_dict)
            except ValidationError as e:
                return abort(422, description=str(e))
            reading = marshal.unmarshal(ReadingOrm, mobile_reading_dict)
            invariant.resolve_reading_invariants(reading)
            crud.create(reading, refresh=True)

    # Read all readings that have been created or updated since last sync
    current_user = user_utils.get_current_user_from_jwt()
    new_readings = view.reading_view(cast(dict[Any, Any], current_user), last_sync)

    return {
        "readings": [serialize.serialize_reading(r) for r in new_readings],
    }


# /api/sync/referrals [POST]
@api_sync.post("/referrals")
def sync_referrals(query: LastSyncQueryParam, body: SyncReferralsBody):
    """Sync Referrals"""
    last_sync = query.since
    patients_on_server_cache = set()
    for mobile_referral in body.referrals:
        mobile_referral_dict = mobile_referral.model_dump()
        if mobile_referral_dict.get("patient_id") not in patients_on_server_cache:
            patient_on_server = crud.read(
                PatientOrm, id=mobile_referral_dict.get("patient_id")
            )
            if patient_on_server is None:
                continue
            patients_on_server_cache.add(patient_on_server.id)

        if crud.read(ReferralOrm, id=mobile_referral_dict.get("id")):
            # currently, for referrals that exist in server already we will
            # skip them
            continue
        ReferralEntityValidator(**mobile_referral_dict)

        referral = marshal.unmarshal(ReferralOrm, mobile_referral_dict)
        crud.create(referral, refresh=True)

    # Read all referrals that have been created or updated since last sync
    current_user = user_utils.get_current_user_from_jwt()
    new_referrals = view.referral_view(cast(dict[Any, Any], current_user), last_sync)

    return {
        "referrals": [
            serialize.serialize_referral_or_assessment(r) for r in new_referrals
        ],
    }


# /api/sync/assessments [POST]
def sync_assessments(query: LastSyncQueryParam):
    """Sync Assessments"""
    last_sync = query.since

    # Read all assessments that have been updated since last sync
    current_user = user_utils.get_current_user_from_jwt()
    new_assessments = view.assessment_view(
        cast(dict[Any, Any], current_user), last_sync
    )

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
