"""
The ``service.util`` contains utility functions to help simplify useful information into a dict
instead of using marshal on the whole Object.
"""
from models import Patient

# simplify version of the patient API
def serialize_patient(p: Patient):
    data = {
        "patientId": p.patientId,
        "patientName": p.patientName,
        "villageNumber": p.villageNumber,
        "trafficLightStatus": p.readings[len(p.readings) - 1].get_traffic_light(),
        "dateTimeTaken": p.readings[len(p.readings) - 1].dateTimeTaken,
    }
    return data
