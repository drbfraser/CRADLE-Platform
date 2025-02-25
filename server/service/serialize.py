"""
The ``service.util`` contains utility functions to help simplify useful information into a dict
instead of using marshal on the whole Object.
"""

from typing import Any, List, Optional, Tuple, Union

from marshmallow import ValidationError

from common.form_utils import filter_template_questions_dict
from data import marshal
from models import (
    AssessmentOrm,
    MedicalRecordOrm,
    PatientOrm,
    PregnancyOrm,
    ReadingOrm,
    ReferralOrm,
    UrineTestOrm,
)


def serialize_patient_list(patients: List[Any]) -> list[dict]:
    return [
        {
            "id": p.id,
            "name": p.name,
            "village_number": p.village_number,
            "traffic_light_status": (
                p.traffic_light_status.value if p.traffic_light_status else ""
            ),
            "date_taken": p.date_taken if p.date_taken else "",
        }
        for p in patients
    ]


def serialize_patients_admin(patients: List[Any]) -> list[dict]:
    return [
        {
            "id": p.id,
            "name": p.name,
            "is_archived": p.is_archived,
        }
        for p in patients
    ]


def serialize_referral_list(referrals: List[Any]) -> list[dict]:
    return [
        {
            "referral_id": referral.referral_id,
            "patient_id": referral.patient_id,
            "patient_name": referral.patient_name,
            "village_number": referral.village_number,
            "date_referred": referral.date_referred,
            "is_assessed": referral.is_assessed,
            "vital_sign": referral.vital_sign.value,
        }
        for referral in referrals
        if referral.referral_id is not None
    ]


def serialize_pregnancy(pregnancy: PregnancyOrm) -> dict:
    return {
        "id": pregnancy.id,
        "start_date": pregnancy.start_date,
        "end_date": pregnancy.end_date,
        "outcome": pregnancy.outcome,
        "last_edited": pregnancy.last_edited,
    }


def serialize_medical_record(record: MedicalRecordOrm) -> dict:
    return {
        "id": record.id,
        "patient_id": record.patient_id,
        "information": record.information,
        "date_created": record.date_created,
        "last_edited": record.last_edited,
    }


def serialize_patient_timeline(r: Any) -> dict:
    return {
        "title": r.title,
        "information": r.information,
        "date": r.date,
    }


def serialize_patient(
    patient: Any,
    readings: Optional[List[ReadingOrm]] = None,
    referrals: Optional[List[ReferralOrm]] = None,
    assessments: Optional[List[AssessmentOrm]] = None,
) -> dict:
    return {
        "id": patient.patient_id,
        "name": patient.name,
        "sex": patient.sex.value,
        "date_of_birth": str(patient.date_of_birth),
        "is_exact_date_of_birth": patient.is_exact_date_of_birth,
        "zone": patient.zone,
        "household_number": patient.household_number,
        "village_number": patient.village_number,
        "allergy": patient.allergy,
        "is_pregnant": bool(patient.pregnancy_start_date),
        "pregnancy_id": patient.pregnancy_id,
        "pregnancy_start_date": patient.pregnancy_start_date,
        "medical_history_id": patient.medical_history_id,
        "medical_history": patient.medical_history,
        "drug_history_id": patient.drug_history_id,
        "drug_history": patient.drug_history,
        "last_edited": patient.last_edited,
        "base": patient.last_edited,
        "readings": [serialize_reading(r) for r in readings] if readings else [],
        "referrals": (
            [serialize_referral_or_assessment(r) for r in referrals]
            if referrals
            else []
        ),
        "assessments": (
            [serialize_referral_or_assessment(a) for a in assessments]
            if assessments
            else []
        ),
        "is_archived": patient.is_archived,
    }


def serialize_reading(tup: Tuple[ReadingOrm, UrineTestOrm]) -> dict:
    reading = marshal.marshal(tup[0], True)
    reading["urine_tests"] = marshal.marshal(tup[1]) if tup[1] is not None else None
    return reading


def serialize_referral_or_assessment(model: Union[ReferralOrm, AssessmentOrm]) -> dict:
    return marshal.marshal(model)


def serialize_blank_form_template(form_template: dict) -> dict:
    del form_template["date_created"]
    del form_template["version"]

    return filter_template_questions_dict(form_template)


def deserialize_patient(
    patient_data: dict,
    shallow: bool = True,
    partial: bool = False,
) -> Union[dict, PatientOrm]:
    schema = PatientOrm.schema()
    d = {
        "id": patient_data.get("id"),
        "name": patient_data.get("name"),
        "sex": patient_data.get("sex"),
        "date_of_birth": patient_data.get("date_of_birth"),
        "is_exact_date_of_birth": patient_data.get("is_exact_date_of_birth"),
        "zone": patient_data.get("zone"),
        "village_number": patient_data.get("village_number"),
        "household_number": patient_data.get("household_number"),
        "allergy": patient_data.get("allergy"),
        "is_archived": patient_data.get("is_archived"),
    }
    if partial:
        if err := schema().validate(d, partial=True):
            raise ValidationError(err)
        return d

    patient = schema().load(d)
    if shallow:
        return patient

    medical_records = list()
    if patient_data.get("medical_history"):
        medical_records.append(deserialize_medical_record(patient_data, False))
    if patient_data.get("drug_history"):
        medical_records.append(deserialize_medical_record(patient_data, True))

    pregnancies = list()
    if patient_data.get("pregnancy_start_date"):
        pregnancies.append(deserialize_pregnancy(patient_data))

    if medical_records:
        patient.records = medical_records
    if pregnancies:
        patient.pregnancies = pregnancies

    return patient


def deserialize_pregnancy(
    patient_data: dict, partial: bool = False
) -> Union[dict, PregnancyOrm]:
    schema = PregnancyOrm.schema()
    if partial:
        d = {
            "end_date": patient_data.get("pregnancy_end_date"),
            "outcome": patient_data.get("pregnancy_outcome"),
        }
        if err := schema().validate(d, partial=True):
            raise ValidationError(err)
        return {k: v for k, v in d.items() if v}

    d = {
        "patient_id": patient_data.get("id"),
        "start_date": patient_data.get("pregnancy_start_date"),
    }
    return schema().load(d)


def deserialize_medical_record(
    patient_data: dict, is_drug_record: bool
) -> MedicalRecordOrm:
    schema = MedicalRecordOrm.schema()
    d = {
        "patient_id": patient_data.get("id"),
        "information": (
            patient_data.get("drug_history")
            if is_drug_record
            else patient_data.get("medical_history")
        ),
        "is_drug_record": is_drug_record,
    }
    if (not is_drug_record and patient_data.get("medical_last_edited")) or (
        is_drug_record and patient_data.get("drug_last_edited")
    ):
        d["date_created"] = (
            patient_data["drug_last_edited"]
            if is_drug_record
            else patient_data["medical_last_edited"]
        )
    return schema().load(d)
