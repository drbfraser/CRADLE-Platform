"""
The ``service.util`` contains utility functions to help simplify useful information into a dict
instead of using marshal on the whole Object.
"""
from typing import Any, List, Optional

import data.marshal as marshal
from models import MedicalRecord, Pregnancy, Reading


def serialize_patient(p: Any) -> dict:
    return {
        "patientId": p.patientId,
        "patientName": p.patientName,
        "villageNumber": p.villageNumber,
        "trafficLightStatus": p.trafficLightStatus.value
        if p.trafficLightStatus
        else "",
        "dateTimeTaken": p.dateTimeTaken if p.dateTimeTaken else "",
    }


def serialize_referral(r: Any) -> dict:
    return {
        "referralId": r.id,
        "patientId": r.patientId,
        "patientName": r.patientName,
        "villageNumber": r.villageNumber,
        "trafficLightStatus": r.trafficLightStatus.value,
        "dateReferred": r.dateReferred,
        "isAssessed": r.isAssessed,
    }


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


def serialize_patient_with_records(
    patient: Any, readings: Optional[List[Reading]] = None
) -> dict:
    return {
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
        "readings": [marshal.marshal(r) for r in readings] if readings else [],
    }
