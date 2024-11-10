"""
The ``service.util`` contains utility functions to help simplify useful information into a dict
instead of using marshal on the whole Object.
"""

from typing import Any, List, Optional, Tuple, Union

from marshmallow import ValidationError

from data import marshal
from models import (
    FollowUpOrm,
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
            "name": referral.name,
            "village_number": referral.village_number,
            "date_referred": referral.date_referred,
            "is_assessed": referral.is_assessed,
            "vital_sign": referral.vital_sign.value,
        }
        for referral in referrals
    ]


def serialize_pregnancy(pregnancy: PregnancyOrm) -> dict:
    return {
        "pregnancy_id": pregnancy.id,
        "start_date": pregnancy.start_date,
        "end_date": pregnancy.end_date,
        "outcome": pregnancy.outcome,
        "last_edited": pregnancy.last_edited,
    }


def serialize_medical_record(record: MedicalRecordOrm) -> dict:
    return {
        "medicalRecordId": record.id,
        "information": record.information,
        "dateCreated": record.dateCreated,
        "lastEdited": record.lastEdited,
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
    assessments: Optional[List[FollowUpOrm]] = None,
) -> dict:
    p = {
        "patient_id": patient.patient_id,
        "name": patient.name,
        "sex": patient.sex.value,
        "date_of_birth": str(patient.date_of_birth),
        "is_exact_date_of_birth": patient.is_exact_date_of_birth,
        "zone": patient.zone,
        "household_number": patient.household_number,
        "village_number": patient.village_number,
        "allergy": patient.allergy,
        "isPregnant": bool(patient.pregnancyStartDate),
        "pregnancyId": patient.pregnancyId,
        "pregnancyStartDate": patient.pregnancyStartDate,
        "gestationalAgeUnit": (
            patient.gestationalAgeUnit.value if patient.gestationalAgeUnit else None
        ),
        "medicalHistoryId": patient.medicalHistoryId,
        "medicalHistory": patient.medicalHistory,
        "drugHistoryId": patient.drugHistoryId,
        "drugHistory": patient.drugHistory,
        "lastEdited": patient.lastEdited,
        "base": patient.lastEdited,
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
    return {k: v for k, v in p.items() if v or v is False}


def serialize_reading(tup: Tuple[ReadingOrm, UrineTestOrm]) -> dict:
    reading = marshal.marshal(tup[0], True)
    if tup[1]:
        reading["urineTests"] = marshal.marshal(tup[1])
    return reading


def serialize_referral_or_assessment(model: Union[ReferralOrm, FollowUpOrm]) -> dict:
    return marshal.marshal(model)


def serialize_blank_form_template(form_template: dict) -> dict:
    del form_template["dateCreated"]
    del form_template["lastEdited"]
    del form_template["version"]

    return form_template


def deserialize_patient(
    data: dict,
    shallow: bool = True,
    partial: bool = False,
) -> Union[dict, PatientOrm]:
    schema = PatientOrm.schema()
    d = {
        "id": data.get("id"),
        "name": data.get("name"),
        "sex": data.get("sex"),
        "date_of_birth": data.get("date_of_birth"),
        "is_exact_date_of_birth": data.get("is_exact_date_of_birth"),
        "zone": data.get("zone"),
        "village_number": data.get("village_number"),
        "household_number": data.get("household_number"),
        "allergy": data.get("allergy"),
        "is_archived": data.get("is_archived"),
    }
    if partial:
        if err := schema().validate(d, partial=True):
            raise ValidationError(err)
        return d

    patient = schema().load(d)
    if shallow:
        return patient

    medical_records = list()
    if data.get("medicalHistory"):
        medical_records.append(deserialize_medical_record(data, False))
    if data.get("drugHistory"):
        medical_records.append(deserialize_medical_record(data, True))

    pregnancies = list()
    if data.get("pregnancyStartDate"):
        pregnancies.append(deserialize_pregnancy(data))

    if medical_records:
        patient.records = medical_records
    if pregnancies:
        patient.pregnancies = pregnancies

    return patient


def deserialize_pregnancy(
    data: dict, partial: bool = False
) -> Union[dict, PregnancyOrm]:
    schema = PregnancyOrm.schema()
    if partial:
        d = {
            "end_date": data.get("pregnancy_end_date"),
            "outcome": data.get("pregnancy_outcome"),
        }
        if err := schema().validate(d, partial=True):
            raise ValidationError(err)
        return {k: v for k, v in d.items() if v}

    d = {
        "patient_id": data.get("patient_id"),
        "startDate": data.get("pregnancyStartDate"),
        "defaultTimeUnit": data.get("gestationalAgeUnit"),
    }
    return schema().load(d)


def deserialize_medical_record(data: dict, is_drug_record: bool) -> MedicalRecordOrm:
    schema = MedicalRecordOrm.schema()
    d = {
        "patient_id": data.get("patient_id"),
        "information": (
            data.get("drugHistory") if is_drug_record else data.get("medicalHistory")
        ),
        "isDrugRecord": is_drug_record,
    }
    if (not is_drug_record and data.get("medicalLastEdited")) or (
        is_drug_record and data.get("drugLastEdited")
    ):
        d["dateCreated"] = (
            data["drugLastEdited"] if is_drug_record else data["medicalLastEdited"]
        )
    return schema().load(d)
