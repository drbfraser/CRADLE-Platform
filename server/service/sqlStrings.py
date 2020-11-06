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
