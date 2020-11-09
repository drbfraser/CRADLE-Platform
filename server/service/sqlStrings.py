"""
Returns SQL strings for crud.py queries
"""
from typing import Type, TypeVar
from models import Patient, Referral, User

M = TypeVar("M")


def get_sql_string(search_param: str, **kwargs) -> str:
    limit = kwargs.get("limit", None)
    page = kwargs.get("page", None)
    sortBy = kwargs.get("sortBy", None)
    sortDir = kwargs.get("sortDir", None)

    if search_param is not None:
        return (
            " WHERE patientName LIKE '%"
            + search_param
            + "%' OR p.patientId LIKE '"
            + search_param
            + "%'"
            + " ORDER BY "
            + sortBy
            + " "
            + sortDir
            + " LIMIT "
            + str((page - 1) * limit)
            + ", "
            + str(limit)
        )

    elif search_param is None:
        return (
            " ORDER BY "
            + sortBy
            + " "
            + sortDir
            + " LIMIT "
            + str((page - 1) * limit)
            + ", "
            + str(limit)
        )
    else:
        return ""


def get_sql_table_operations(m: Type[M]) -> str:
    if m.schema() == Patient.schema():
        return (
            "SELECT p.patientName, "
            "p.patientId, "
            "p.villageNumber, "
            "r.trafficLightStatus, "
            "r.dateTimeTaken"
            " FROM patient p LEFT JOIN reading r ON r.readingId = "
            "(SELECT r2.readingId FROM reading r2 WHERE r2.patientId=p.patientId"
            " ORDER BY r2.dateTimeTaken DESC LIMIT 1) "
        )

    elif m.schema() == Referral.schema():
        return (
            "SELECT p.patientId,"
            " p.patientName,"
            " p.villageNumber,"
            " rd.trafficLightStatus,"
            " rf.dateReferred,"
            " rf.isAssessed,"
            " rf.id"
            " FROM referral rf"
            " JOIN patient p ON rf.patientId=p.patientId"
            " JOIN reading rd ON rd.readingId=rf.readingId"
        )


def get_sql_table_operation_assoc(patient: bool, user: User) -> str:
    if patient:
        return (
            "SELECT p.patientName, "
            "p.patientId, "
            "p.villageNumber, "
            "r.trafficLightStatus, "
            "r.dateTimeTaken"
            " FROM patient p JOIN patient_associations pa ON p.patientId = pa.patientId"
            " AND pa.userId=" + str(user.id) + " LEFT JOIN reading r ON r.readingId = "
            "(SELECT r2.readingId FROM reading r2 WHERE r2.patientId=p.patientId"
            " ORDER BY r2.dateTimeTaken DESC LIMIT 1) "
        )
    else:
        return (
            "SELECT p.patientId,"
            " p.patientName,"
            " p.villageNumber,"
            " rd.trafficLightStatus,"
            " rf.dateReferred,"
            " rf.isAssessed,"
            " rf.id"
            " FROM referral rf"
            " JOIN patient p ON rf.patientId=p.patientId"
            " JOIN reading rd ON rd.readingId=rf.readingId"
            " JOIN patient_associations pa ON rf.patientId=pa.patientId"
            " AND pa.userId=" + str(user.id)
        )


def get_sql_table_operation_assoc_vht_list(patient: bool, sql_str_vht_ids: str) -> str:
    if patient:
        return (
            "SELECT p.patientName, "
            "p.patientId, "
            "p.villageNumber, "
            "r.trafficLightStatus, "
            "r.dateTimeTaken"
            " FROM patient p JOIN patient_associations pa ON p.patientId = pa.patientId"
            " AND pa.userId in ("
            + sql_str_vht_ids
            + ") LEFT JOIN reading r ON r.readingId = "
            "(SELECT r2.readingId FROM reading r2 WHERE r2.patientId=p.patientId"
            " ORDER BY r2.dateTimeTaken DESC LIMIT 1) "
        )
    else:
        return (
            "SELECT p.patientId,"
            " p.patientName,"
            " p.villageNumber,"
            " rd.trafficLightStatus,"
            " rf.dateReferred,"
            " rf.isAssessed,"
            " rf.id"
            " FROM referral rf"
            " JOIN patient p ON rf.patientId=p.patientId"
            " JOIN reading rd ON rd.readingId=rf.readingId"
            " JOIN patient_associations pa ON rf.patientId=pa.patientId"
            " AND pa.userId in (" + sql_str_vht_ids + ")"
        )


def get_sql_for_readings(user_ids: str, is_admin: bool) -> str:
    shared_reading_query = get_sql_shared_query()
    if is_admin:
        return shared_reading_query + " ORDER BY r.patientId ASC"
    else:
        return (
            shared_reading_query
            + " JOIN patient_associations pa ON r.patientId=pa.patientId AND pa.userId IN ("
            + user_ids
            + ") ORDER BY r.patientId ASC"
        )


def get_sql_shared_query() -> str:
    return (
        "SELECT rf.id as rf_id, "
        "ut.id as ut_id, "
        "ut.urineTestLeuc as ut_urineTestLeuc, "
        "ut.urineTestNit as ut_urineTestNit, "
        "ut.urineTestGlu as ut_urineTestGlu, "
        "ut.urineTestPro as ut_urineTestPro, "
        "ut.urineTestBlood as ut_urineTestBlood, "
        "fu.id as fu_id, "
        "fu.followupInstructions as fu_followupInstructions, "
        "fu.specialInvestigations as fu_specialInvestigations, "
        "fu.diagnosis as fu_diagnosis, "
        "fu.treatment as fu_treatment, "
        "fu.medicationPrescribed as fu_medicationPrescribed, "
        "fu.dateAssessed as fu_dateAssessed, "
        "fu.followupNeeded as fu_followupNeeded, "
        "fu.readingId as fu_readingId, "
        "fu.healthcareWorkerId as fu_healthcareWorkerId, "
        "rf.comment as rf_comment, "
        "rf.isAssessed as rf_isAssessed, "
        "rf.referralHealthFacilityName as rf_referralHealthFacilityName, "
        "rf.patientId as rf_patientId, "
        "rf.readingId as rf_readingId, "
        "rf.dateReferred as rf_dateReferred, "
        "r.readingId as r_readingId, "
        "r.bpSystolic as r_bpSystolic, "
        "r.bpDiastolic as r_bpDiastolic, "
        "r.heartRateBPM as r_heartRateBPM, "
        "r.respiratoryRate as r_respiratoryRate, "
        "r.oxygenSaturation as r_oxygenSaturation, "
        "r.temperature as r_temperature, "
        "r.symptoms as r_symptoms, "
        "r.trafficLightStatus as r_trafficLightStatus, "
        "r.dateTimeTaken as r_dateTimeTaken, "
        "r.dateRecheckVitalsNeeded as r_dateRecheckVitalsNeeded, "
        "r.retestOfPreviousReadingIds as r_retestOfPreviousReadingIds, "
        "r.patientId as r_patientId, "
        "r.isFlaggedForFollowup as r_isFlaggedForFollowup"
        " FROM reading r LEFT OUTER JOIN referral rf on r.readingId=rf.readingId"
        " LEFT OUTER JOIN followup fu on r.readingId=fu.readingId"
        " LEFT OUTER JOIN urine_test ut on r.readingId=ut.readingId"
    )
