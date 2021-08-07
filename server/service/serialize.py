"""
The ``service.util`` contains utility functions to help simplify useful information into a dict
instead of using marshal on the whole Object.
"""
from typing import Any, List, Optional, Tuple

import data.marshal as marshal
from models import FollowUp, MedicalRecord, Pregnancy, Reading, Referral, UrineTest


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


def serialize_referral_list(referrals: List[Any]) -> dict:
    return [
        {
            "referralId": r.id,
            "patientId": r.patientId,
            "patientName": r.patientName,
            "villageNumber": r.villageNumber,
            "trafficLightStatus": r.trafficLightStatus.value,
            "dateReferred": r.dateReferred,
            "isAssessed": r.isAssessed,
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


def serialize_patient(patient: Any, readings: Optional[List[Reading]] = None) -> dict:
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
    }
    return {k: v for k, v in p.items() if v or v == False}


def serialize_reading(tup: Tuple[Reading, Referral, FollowUp, UrineTest]) -> dict:
    reading = marshal.marshal(tup[0], True)
    if tup[1]:
        reading["referral"] = marshal.marshal(tup[1])
    if tup[2]:
        reading["followup"] = marshal.marshal(tup[2])
    if tup[3]:
        reading["urineTests"] = marshal.marshal(tup[3])
    return reading
