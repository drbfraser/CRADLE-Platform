"""
The ``service.util`` contains utility functions to help simplify useful information into a dict
instead of using marshal on the whole Object.
"""
from typing import Any, List, Optional, Tuple, Union
from marshmallow import ValidationError

import data.marshal as marshal
from models import (
    FollowUp,
    MedicalRecord,
    Patient,
    Pregnancy,
    Reading,
    Referral,
    UrineTest,
)
from models import FormTemplate


def serialize_patient_list(patients: List[Any]) -> dict:
    return [
        {
            "patientId": p.patientId,
            "patientName": p.patientName,
            "villageNumber": p.villageNumber,
            "trafficLightStatus": p.trafficLightStatus.value
            if p.trafficLightStatus
            else "",
            "dateTimeTaken": p.dateTimeTaken if p.dateTimeTaken else "",
        }
        for p in patients
    ]

def serialize_patients_admin(patients: List[Any]) -> dict:
    return [
        {
            "patientId": p.patientId,
            "patientName": p.patientName,
            "isArchived": p.isArchived,
        }
        for p in patients
    ]


def serialize_referral_list(referrals: List[Any]) -> dict:
    return [
        {
            "referralId": r.id,
            "patientId": r.patientId,
            "patientName": r.patientName,
            "villageNumber": r.villageNumber,
            "dateReferred": r.dateReferred,
            "isAssessed": r.isAssessed,
            "vitalSign": r.vitalSign.value,
        }
        for r in referrals
    ]


def serialize_pregnancy(p: Pregnancy) -> dict:
    return {
        "pregnancyId": p.id,
        "startDate": p.startDate,
        "endDate": p.endDate,
        "outcome": p.outcome,
        "lastEdited": p.lastEdited,
    }


def serialize_medical_record(r: MedicalRecord) -> dict:
    return {
        "medicalRecordId": r.id,
        "information": r.information,
        "dateCreated": r.dateCreated,
        "lastEdited": r.lastEdited,
    }


def serialize_patient_timeline(r: Any) -> dict:
    return {
        "title": r.title,
        "information": r.information,
        "date": r.date,
    }


def serialize_patient(
    patient: Any,
    readings: Optional[List[Reading]] = None,
    referrals: Optional[List[Referral]] = None,
    assessments: Optional[List[FollowUp]] = None,
) -> dict:
    p = {
        "patientId": patient.patientId,
        "patientName": patient.patientName,
        "patientSex": patient.patientSex.value,
        "dob": str(patient.dob),
        "isExactDob": patient.isExactDob,
        "zone": patient.zone,
        "householdNumber": patient.householdNumber,
        "villageNumber": patient.villageNumber,
        "allergy": patient.allergy,
        "isPregnant": True if patient.pregnancyStartDate else False,
        "pregnancyId": patient.pregnancyId,
        "pregnancyStartDate": patient.pregnancyStartDate,
        "gestationalAgeUnit": patient.gestationalAgeUnit.value
        if patient.gestationalAgeUnit
        else None,
        "medicalHistoryId": patient.medicalHistoryId,
        "medicalHistory": patient.medicalHistory,
        "drugHistoryId": patient.drugHistoryId,
        "drugHistory": patient.drugHistory,
        "lastEdited": patient.lastEdited,
        "base": patient.lastEdited,
        "readings": [serialize_reading(r) for r in readings] if readings else [],
        "referrals": [serialize_referral_or_assessment(r) for r in referrals]
        if referrals
        else [],
        "assessments": [serialize_referral_or_assessment(a) for a in assessments]
        if assessments
        else [],
    }
    return {k: v for k, v in p.items() if v or v == False}


def serialize_reading(tup: Tuple[Reading, UrineTest]) -> dict:
    reading = marshal.marshal(tup[0], True)
    if tup[1]:
        reading["urineTests"] = marshal.marshal(tup[1])
    return reading


def serialize_referral_or_assessment(model: Union[Referral, FollowUp]) -> dict:
    return marshal.marshal(model)


def serialize_blank_form_template(form_template: dict) -> dict:
    del form_template["dateCreated"]
    del form_template["lastEdited"]
    del form_template["version"]

    return form_template


def deserialize_patient(
    data: dict, shallow: bool = True, partial: bool = False
) -> Union[dict, Patient]:
    schema = Patient.schema()
    d = {
        "patientId": data.get("patientId"),
        "patientName": data.get("patientName"),
        "patientSex": data.get("patientSex"),
        "patientSex": data.get("patientSex"),
        "dob": data.get("dob"),
        "isExactDob": data.get("isExactDob"),
        "zone": data.get("zone"),
        "villageNumber": data.get("villageNumber"),
        "householdNumber": data.get("householdNumber"),
        "allergy": data.get("allergy"),
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


def deserialize_pregnancy(data: dict, partial: bool = False) -> Union[dict, Pregnancy]:
    schema = Pregnancy.schema()
    if partial:
        d = {
            "endDate": data.get("pregnancyEndDate"),
            "outcome": data.get("pregnancyOutcome"),
        }
        if err := schema().validate(d, partial=True):
            raise ValidationError(err)
        return {k: v for k, v in d.items() if v}

    d = {
        "patientId": data.get("patientId"),
        "startDate": data.get("pregnancyStartDate"),
        "defaultTimeUnit": data.get("gestationalAgeUnit"),
    }
    return schema().load(d)


def deserialize_medical_record(data: dict, is_drug_record: bool) -> MedicalRecord:
    schema = MedicalRecord.schema()
    d = {
        "patientId": data.get("patientId"),
        "information": data.get("drugHistory")
        if is_drug_record
        else data.get("medicalHistory"),
        "isDrugRecord": is_drug_record,
    }
    if (not is_drug_record and data.get("medicalLastEdited")) or (
        is_drug_record and data.get("drugLastEdited")
    ):
        d["dateCreated"] = (
            data["drugLastEdited"] if is_drug_record else data["medicalLastEdited"]
        )
    return schema().load(d)
