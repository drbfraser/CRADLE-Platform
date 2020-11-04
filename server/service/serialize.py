"""
The ``service.util`` contains utility functions to help simplify useful information into a dict
instead of using marshal on the whole Object.
"""
from models import Patient

# simplify version of the patient API
def serialize_patient(p: any):
    data = {
        "patientId": p.patientId,
        "patientName": p.patientName,
        "villageNumber": p.villageNumber,
        "trafficLightStatus": "" if p.trafficLightStatus == "null" else p.trafficLightStatus,
        "dateTimeTaken": "" if p.dateTimeTaken == "null" else p.dateTimeTaken,
    }
    return data


def serialize_referral(r: any):
    data = {
        "referralId": r.id,
        "patientId": r.patientId,
        "patientName": r.patientName,
        "trafficLightStatus": r.trafficLightStatus,
        "dateReferred": r.dateReferred,
        "isAssessed": r.isAssessed,
    }
    return data
