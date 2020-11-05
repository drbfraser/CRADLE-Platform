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
            d["base"] = value
        if column == "dob":
            d[column] = str(value)
        else:
            d[column] = value

    d["readings"] = []
    return d


def serialize_reading_sql_to_dict(d: any, row: any) -> dict:
    followup = {}
    referral = {}
    for column, value in row.items():
        # followup
        if "fu_" in column:
            followup[column.replace("fu_", "")] = value
        # referral
        elif "rf_" in column:
            referral[column.replace("rf_", "")] = value
        # reading
        else:
            d[column.replace("r_", "")] = value

    d["referral"] = None if referral["id"] is None else referral
    d["followup"] = None if followup["id"] is None else followup

    return d
