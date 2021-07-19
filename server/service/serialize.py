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
        "trafficLightStatus": ""
        if p.trafficLightStatus == "null"
        else p.trafficLightStatus,
        "dateTimeTaken": "" if p.dateTimeTaken == "null" else p.dateTimeTaken,
    }


def serialize_referral(r: any):
    return {
        "referralId": r.id,
        "patientId": r.patientId,
        "patientName": r.patientName,
        "villageNumber": r.villageNumber,
        "trafficLightStatus": r.trafficLightStatus,
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
        "base": p.lastEdited,
        "householdNumber": p.householdNumber,
        "isExactDob": p.isExactDob,
        "allergy": p.allergy,
        "readings": [],
    }


def serialize_patient_sql_to_dict(d: any, row: any) -> dict:
    for column, value in row.items():
        if value is None:
            continue

        if column == "lastEdited":
            # The API representation of a patient contains a "base" field which is used by
            # mobile for syncing. When getting a patient from an API, this value is always
            # equivalent to "lastEdited".
            d = {**d, **{"base": value}}

        if column == "dob":
            d = {**d, **{column: str(value)}}
        elif column == "isPregnant":
            d = {**d, **{column: is_null_or_bool(value)}}
        elif column == "isExactDob":
            d = {**d, **{column: is_null_or_bool(value)}}
        else:
            d = {**d, **{column: value}}

    d = {**d, **{"readings": []}}
    return d


def serialize_reading_sql_to_dict(d: any, row: any) -> dict:
    followup = {}
    referral = {}
    urine_test = {}
    for column, value in row.items():
        if value is None:
            continue
        # followup
        if "fu_" in column:
            if "fu_followupNeeded" in column:
                followup = {
                    **followup,
                    **{column.replace("fu_", ""): is_null_or_bool(value)},
                }
            else:
                followup = {**followup, **{column.replace("fu_", ""): value}}
        # referral
        elif "rf_" in column:
            if "rf_isAssessed" in column:
                referral = {
                    **referral,
                    **{column.replace("rf_", ""): is_null_or_bool(value)},
                }
            else:
                referral = {**referral, **{column.replace("rf_", ""): value}}
        # urine test
        elif "ut_" in column:
            urine_test = {**urine_test, **{column.replace("ut_", ""): value}}
        # reading
        else:
            if "r_isFlaggedForFollowup" in column:
                d = {**d, **{column.replace("r_", ""): is_null_or_bool(value)}}
            else:
                d = {**d, **{column.replace("r_", ""): value}}

    d = {**d, **{"referral": None if referral.get("id") is None else referral}}
    d = {**d, **{"followup": None if followup.get("id") is None else followup}}
    d = {**d, **{"urineTests": None if urine_test.get("id") is None else urine_test}}

    return d


def is_null_or_bool(value: any):
    if value is not None:
        return False if value == 0 else True
    else:
        return None
