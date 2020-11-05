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
        "trafficLightStatus": ""
        if p.trafficLightStatus == "null"
        else p.trafficLightStatus,
        "dateTimeTaken": "" if p.dateTimeTaken == "null" else p.dateTimeTaken,
    }
    return data


def serialize_referral(r: any):
    data = {
        "referralId": r.id,
        "patientId": r.patientId,
        "patientName": r.patientName,
        "villageNumber": r.villageNumber,
        "trafficLightStatus": r.trafficLightStatus,
        "dateReferred": r.dateReferred,
        "isAssessed": r.isAssessed,
    }
    return data


def serialize_SQL_to_dict(d: any, row: any, pat_or_reading: bool) -> dict:
    # Case 1 ==> patient dictionary
    # Case 2 ==> reading dictionary

    referral = {}
    # iterate through the row values
    for column, value in row.items():
        # Case 1
        if column == "lastEdited":
            # The API representation of a patient contains a "base" field which is used by
            # mobile for syncing. When getting a patient from an API, this value is always
            # equivalent to "lastEdited".
            d = {**d, **{"base": value}}

        if column == "dob":
            d = {**d, **{column: str(value)}}
        else:
            # Case 2 for reading referral
            if "rf_" in column:
                referral = {**referral, **{column.replace("rf_", ""): value}}
            # Case 2
            else:
                d = {**d, **{column.replace("r_", ""): value}}

    # Case 2
    if not pat_or_reading:
        d = {**d, **{"referral": None if referral.get("id") is None else referral}}
        d = {**d, **{"followup": None}}

    # Case 1
    if pat_or_reading:
        d = {**d, **{"readings": []}}

    return d
