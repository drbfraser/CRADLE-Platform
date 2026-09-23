"""Retrieve patient-related collections through role-aware database queries."""

from typing import Any, Callable, Optional

import data.db_operations as crud
from models import (
    AssessmentOrm,
    MedicalRecordOrm,
    PregnancyOrm,
    ReadingOrm,
    ReferralOrm,
    UrineTestOrm,
)


def patient_list_view(user: dict, **kwargs) -> list[Any]:
    """
    Returns a list of patients filtered by query criteria in keyword arguments.

    :param user: JWT identity
    :param **kwargs: Optional query criteria
    :return: A list of patients each with the fields patient_id, patient_name, village_number
    traffic_light_status, date_taken
    """
    return __get_view(user, crud.read_patient_list, **kwargs)


def referral_list_view(user: dict, **kwargs) -> list[Any]:
    """
    Returns a list of referrals filtered by query criteria in keyword arguments.

    :param user: JWT identity
    :param **kwargs: Optional query criteria
    :return: A list of referrals each with the fields id, patient_id, patientName,
    villageNumber, trafficLightStatus, dateReferred, isAssessed
    """
    return __get_view(user, crud.read_referral_list, **kwargs)


def pregnancy_view(patient_id: str, **kwargs) -> list[PregnancyOrm]:
    """
    Returns a list of pregnancies filtered by query criteria in keyword arguments.

    :param patient_id: The ID of patient to get pregnancies for
    :param **kwargs: Optional query criteria
    :return: A list of pregnancies
    """
    if not kwargs:
        return crud.read_all(PregnancyOrm, patient_id=patient_id)
    return crud.read_medical_records(PregnancyOrm, patient_id, **kwargs)


def medical_record_view(
    patient_id: str,
    is_drug_record: bool,
    **kwargs,
) -> list[MedicalRecordOrm]:
    """
    Returns a list of medical records filtered by query criteria in keyword arguments.

    :param patient_id: The ID of patient to get medical records for
    :param **kwargs: Optional query criteria
    :return: A list of medical records
    """
    if not kwargs:
        return crud.read_all(
            MedicalRecordOrm,
            patient_id=patient_id,
            is_drug_record=is_drug_record,
        )
    return crud.read_medical_records(
        MedicalRecordOrm,
        patient_id,
        is_drug_record=is_drug_record,
        **kwargs,
    )


def patient_view(user: dict, last_sync: Optional[int] = None) -> list[Any]:
    """
    Returns a list of patients each with the latest pregnancy, medical and drug records.

    :param user: JWT identity
    :return: A list of patients
    """
    return __get_view(user, crud.read_patients, last_edited=last_sync)


def reading_view(
    user: dict,
    last_sync: Optional[int] = None,
) -> list[tuple[ReadingOrm, UrineTestOrm]]:
    """
    Returns a list of readings each with corresponding urine test.

    :param user: JWT identity
    :return: A list of tuples of reading, urine test
    """
    return __get_view(user, crud.read_readings, last_edited=last_sync)


def referral_view(user: dict, last_sync: Optional[int] = None) -> list[ReferralOrm]:
    """
    Returns a list of referrals of readings associated with user.

    :param user: JWT identity
    :return: A list of referrals
    """
    return __get_view(
        user,
        crud.read_referrals_or_assessments,
        model=ReferralOrm,
        last_edited=last_sync,
    )


def assessment_view(user: dict, last_sync: Optional[int] = None) -> list[AssessmentOrm]:
    """
    Returns a list of assessments of readings associated with user.

    :param user: JWT identity
    :return: A list of assessments
    """
    return __get_view(
        user,
        crud.read_referrals_or_assessments,
        model=AssessmentOrm,
        last_edited=last_sync,
    )


def admin_patient_view(user: dict, **kwargs) -> list[Any]:
    """
    Returns a list of patients filtered by query criteria in keyword arguments.

    :param user: JWT identity
    :param **kwargs: Optional query criteria
    :return: A list of patients each with the fields id, name, is_archived
    """
    return crud.read_admin_patient(**kwargs)


def __get_view(user: dict, func: Callable, **kwargs) -> list[Any]:
    return func(user=user, **kwargs)
