"""
The ``service.util`` contains utility functions to help simplify useful information into a dict
instead of using marshal on the whole Object.
"""


# simplify version of the patient API
def serialize_patient(p: any):
    return {
        "patientId": p.patientId,
        "patientName": p.patientName,
        "villageNumber": p.villageNumber,
        "trafficLightStatus": p.trafficLightStatus.value
        if p.trafficLightStatus
        else "",
        "dateTimeTaken": p.dateTimeTaken if p.dateTimeTaken else "",
    }


def serialize_referral(r: any):
    return {
        "referralId": r.id,
        "patientId": r.patientId,
        "patientName": r.patientName,
        "villageNumber": r.villageNumber,
        "trafficLightStatus": r.trafficLightStatus.value,
        "dateReferred": r.dateReferred,
        "isAssessed": r.isAssessed,
    }


def serialize_pregnancy(p: any):
    return {
        "pregnancyId": p.id,
        "startDate": p.startDate,
        "endDate": p.endDate,
        "outcome": p.outcome,
        "lastEdited": p.lastEdited,
    }


def serialize_medical_record(r: any):
    return {
        "medicalRecordId": r.id,
        "information": r.information,
        "dateCreated": r.dateCreated,
        "lastEdited": r.lastEdited,
    }


def serialize_patient_timeline(r: any):
    return {
        "title": r.title,
        "information": r.information,
        "date": r.date,
    }


def serialize_mobile_patient(p: any):
    return {
        "patientId": p.patientId,
        "patientName": p.patientName,
        "patientSex": p.patientSex.value,
        "isPregnant": True if p.pregnancyStartDate else False,
        "gestationalTimestamp": p.pregnancyStartDate,
        "gestationalAgeUnit": p.gestationalAgeUnit.value
        if p.gestationalAgeUnit
        else "MONTHS",
        "medicalHistory": p.medicalHistory,
        "drugHistory": p.drugHistory,
        "zone": p.zone,
        "villageNumber": p.villageNumber,
        "dob": str(p.dob),
        "lastEdited": p.lastEdited,
        "pLastEdited": p.pLastEdited if p.pLastEdited else 0,
        "mLastEdited": p.mLastEdited if p.mLastEdited else 0,
        "dLastEdited": p.dLastEdited if p.dLastEdited else 0,
        "base": p.lastEdited,
        "householdNumber": p.householdNumber,
        "isExactDob": p.isExactDob,
        "allergy": p.allergy,
        "readings": [],
    }
