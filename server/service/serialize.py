"""
The ``service.util`` contains utility functions to help simplify useful information into a dict
instead of using marshal on the whole Object.
"""


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


def serialize_patient_sql_to_dict(d: any, row: any) -> dict:
    for column, value in row.items():
        if column == "lastEdited":
            # The API representation of a patient contains a "base" field which is used by
            # mobile for syncing. When getting a patient from an API, this value is always
            # equivalent to "lastEdited".
            d = {**d, **{"base": value}}

        if column == "dob":
            d = {**d, **{column: str(value)}}
        else:
            d = {**d, **{column: value}}

    d = {**d, **{"readings": []}}
    return d


def serialize_reading_sql_to_dict(d: any, row: any) -> dict:
    followup = {}
    referral = {}
    for column, value in row.items():
        # followup
        if "fu_" in column:
            followup = {**followup, **{column.replace("fu_", ""): value}}
        # referral
        elif "rf_" in column:
            referral = {**referral, **{column.replace("rf_", ""): value}}
        # reading
        else:
            d = {**d, **{column.replace("r_", ""): value}}

    d = {**d, **{"referral": None if referral.get("id") is None else referral}}
    d = {**d, **{"followup": None if followup.get("id") is None else followup}}

    return d
