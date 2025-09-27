"""
stat_queries.py

This module contains database queries focused on statistical reporting and
analytics. It provides functions for retrieving aggregated counts and
summaries related to patient readings, referrals, and associated metrics.

Functions include:
- Counting unique patients with readings.
- Calculating totals and distributions of readings (by count, by traffic light color).
- Measuring referral statistics (sent referrals, referred patients).
- Computing daily activity (days with readings).
- Exporting structured datasets combining patient, referral, and reading info.
"""

from typing import List

from sqlalchemy.sql.expression import and_

from data.db_operations import LOGGER, M, db_session
from models import (
    PatientOrm,
    ReadingOrm,
    ReferralOrm,
)


def get_unique_patients_with_readings(facility="%", user="%", filter={}) -> List[M]:
    """
    Queries the database for unique patients with more than one reading

    :return: A number of unique patients
    """
    query = """
        SELECT COUNT(pat.patient_id) as patients
                FROM (
                    SELECT DISTINCT(P.patient_id)
                    FROM (SELECT R.patient_id FROM reading R
                        JOIN user U ON R.user_id = U.id
                        WHERE R.date_taken BETWEEN :from and :to
                        AND (
                            (user_id LIKE :user OR user_id is NULL)
                            AND (U.health_facility_name LIKE :facility or U.health_facility_name is NULL)
                        )
                    ) as P
                JOIN reading R ON P.patient_id = R.patient_id
                GROUP BY P.patient_id
                HAVING COUNT(R.id) > 0) as pat
    """

    # params used to prevent direct string interpolation inside query
    params = {
        "from": filter.get(
            "from",
            "1900-01-01",
        ),  # default date if 'from' is not provided
        "to": filter.get("to", "2100-12-31"),  # default date if 'to' is not provided
        "user": str(user),
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        LOGGER.error(e)
        return None


def get_total_readings_completed(facility="%", user="%", filter={}) -> List[M]:
    """
    Queries the database for total number of readings completed

    filter: filter date range, otherwise uses max range

    :return: Number of total readings
    """
    query = """
        SELECT COUNT(R.id) AS total_readings
        FROM reading R
        JOIN user U ON U.id = R.user_id
        WHERE R.date_taken BETWEEN :from AND :to
        AND (
            (R.user_id LIKE :user OR R.user_id IS NULL)
            AND (U.health_facility_name LIKE :facility OR U.health_facility_name IS NULL)
        )
    """

    # params used to prevent direct string interpolation inside query
    params = {
        "from": filter.get("from", "1900-01-01"),
        "to": filter.get("to", "2100-12-31"),
        "user": str(user),
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        LOGGER.error(e)
        print(e)
        return None


def get_total_color_readings(facility="%", user="%", filter={}) -> List[M]:
    """
    Queries the database for total number different coloured readings (red up, yellow down, etc)
    filter: filter date range, otherwise uses max range

    :return: Total number of respective coloured readings
    """
    query = """
        SELECT R.traffic_light_status, COUNT(R.traffic_light_status) AS total_readings
        FROM reading R
        JOIN user U ON U.id = R.user_id
        WHERE R.date_taken BETWEEN :from AND :to
        AND (
            (R.user_id LIKE :user OR R.user_id IS NULL)
            AND (U.health_facility_name LIKE :facility OR U.health_facility_name IS NULL)
        )
        GROUP BY R.traffic_light_status
    """

    # params used to prevent direct string interpolation inside query
    params = {
        "from": filter.get("from", "1900-01-01"),
        "to": filter.get("to", "2100-12-31"),
        "user": str(user),
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        LOGGER.error(e)
        print(e)
        return None


def get_sent_referrals(facility="%", user="%", filter={}) -> List[M]:
    """
    Queries the database for total number of sent referrals

    :return: Total number of sent referrals
    """
    query = """
        SELECT COUNT(R.id) AS total_referrals
        FROM referral R
        JOIN user U ON U.id = R.user_id
        WHERE R.date_referred BETWEEN :from AND :to
        AND (
            (R.user_id LIKE :user OR R.user_id IS NULL)
            AND (U.health_facility_name LIKE :facility OR U.health_facility_name IS NULL)
        )
    """

    params = {
        "from": filter.get("from", "1900-01-01"),
        "to": filter.get("to", "2100-12-31"),
        "user": str(user),
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        LOGGER.error(e)
        return None


def get_referred_patients(facility="%", filter={}) -> List[M]:
    """
    Queries the database for total number of patients that have referrals to specified facility

    :return: Total number of referred patients
    """
    query = """
        SELECT COUNT(DISTINCT R.patient_id) AS referred_patients
        FROM referral R
        WHERE R.date_referred BETWEEN :from AND :to
        AND (R.health_facility_name LIKE :facility OR R.health_facility_name IS NULL)
    """

    params = {
        "from": filter.get("from", "1900-01-01"),  # Default start date if not provided
        "to": filter.get("to", "2100-12-31"),  # Default end date if not provided
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        LOGGER.error(e)
        print(e)
        return None


def get_days_with_readings(facility="%", user="%", filter={}):
    """
    Queries the database for number of days within specified timeframe
    which have more than one reading

    :return: number of days
    """
    query = """
        SELECT COUNT(DISTINCT FLOOR(R.date_taken / 86400)) AS days_with_readings
        FROM reading R
        JOIN user U ON U.id = R.user_id
        WHERE R.date_taken BETWEEN :from AND :to
        AND (
            (R.user_id LIKE :user OR R.user_id IS NULL)
            AND (U.health_facility_name LIKE :facility OR U.health_facility_name IS NULL)
        )
    """

    params = {
        "from": filter.get("from", "1900-01-01"),
        "to": filter.get("to", "2100-12-31"),
        "user": str(user),
        "facility": str(facility),
    }

    try:
        result = db_session.execute(query, params)
        return list(result)
    except Exception as e:
        print(e)
        LOGGER.error(e)
        return None


def get_export_data(user_id, filter):
    """
    Queries the database for statistics data for exporting

    :return: list of data for a VHT
    """
    query = (
        (
            db_session.query(
                ReferralOrm.date_referred,
                ReferralOrm.patient_id,
                PatientOrm.name,
                PatientOrm.sex,
                PatientOrm.date_of_birth,
                PatientOrm.is_pregnant,
                ReadingOrm.systolic_blood_pressure,
                ReadingOrm.diastolic_blood_pressure,
                ReadingOrm.heart_rate,
                ReadingOrm.traffic_light_status,
            )
        )
        .outerjoin(
            PatientOrm,
            and_(PatientOrm.id == ReadingOrm.patient_id),
        )
        .outerjoin(
            ReferralOrm,
            and_(ReferralOrm.patient_id == PatientOrm.id),
        )
        .filter(
            ReadingOrm.user_id == user_id,
            ReferralOrm.date_referred.between(
                filter.get("from", "1900-01-01"),
                filter.get("to", "2100-12-31"),
            ),
        )
        .order_by(ReferralOrm.patient_id.desc())
    )

    try:
        resultproxy = query.all()
        result = []
        # Transform ResultProxy into a dict of items
        for rowproxy in resultproxy:
            row = dict(zip(rowproxy.keys(), rowproxy))
            result.append(row)
        return result
    except Exception as e:
        LOGGER.error(e)
        return None
