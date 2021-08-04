"""
Functions for retrieving various subsets of database models.

Different user roles have different requirements on what subset of patients they should
be able to see. The functions in this module compute these subsets for specific users.

The main function is ``patient_view_for_user`` which switches on the role of the given
user to provide an appropriate list of patients. It delegates the work of computing the
actual lists to other functions to ease testing.

The role-specific views are defined as follows:

* ADMIN: can see all patients in the database
* HCW: can see all patients associated with their health facility
* CHO: can see all patients created by them as well as all patients created by VHTs
  they manage.
* VHT: can see all patients created by them
"""

from typing import Any, List, Callable, Tuple

import data.crud as crud
from models import (
    FollowUp,
    Reading,
    Referral,
    RoleEnum,
    Pregnancy,
    MedicalRecord,
    UrineTest,
)


def patient_list_view(user: dict, **kwargs) -> List[Any]:
    """
    Returns a list of patients filtered by query criteria in keyword arguments.

    :param user: JWT identity
    :param **kwargs: Optional query criteria
    :return: A list of patients each with the fields patientId, patientName, villageNumber
    trafficLightStatus, dateTimeTaken
    """
    return __get_view(user, crud.read_patient_list, **kwargs)


def referral_list_view(user: dict, **kwargs) -> List[Any]:
    """
    Returns a list of referrals filtered by query criteria in keyword arguments.

    :param user: JWT identity
    :param **kwargs: Optional query criteria
    :return: A list of referrals each with the fields id, patientId, patientName,
    villageNumber, trafficLightStatus, dateReferred, isAssessed
    """
    return __get_view(user, crud.read_referral_list, **kwargs)


def pregnancy_view(patient_id: str, **kwargs) -> List[Pregnancy]:
    """
    Returns a list of pregnancies filtered by query criteria in keyword arguments.

    :param patient_id: The ID of patient to get pregnancies for
    :param **kwargs: Optional query criteria
    :return: A list of pregnancies
    """
    if not kwargs:
        return crud.read_all(Pregnancy, patientId=patient_id)
    else:
        return crud.read_patient_records(Pregnancy, patient_id, **kwargs)


def medical_record_view(
    patient_id: str, is_drug_record: bool, **kwargs
) -> List[MedicalRecord]:
    """
    Returns a list of medical records filtered by query criteria in keyword arguments.

    :param patient_id: The ID of patient to get medical records for
    :param **kwargs: Optional query criteria
    :return: A list of medical records
    """
    if not kwargs:
        return crud.read_all(
            MedicalRecord, patientId=patient_id, isDrugRecord=is_drug_record
        )
    else:
        return crud.read_patient_records(
            MedicalRecord, patient_id, is_drug_record=is_drug_record, **kwargs
        )


def patient_with_records_view(user: dict) -> List[Any]:
    """
    Returns a list of patients each with the latest pregnancy, medical and durg records.

    :param user: JWT identity
    :return: A list of patients
    """
    return __get_view(user, crud.read_patient_with_records)


def reading_view(user: dict) -> List[Tuple[Reading, Referral, FollowUp, UrineTest]]:
    """
    Returns a list of readings each with corresponding referral, assessment, and urine test.

    :param user: JWT identity
    :return: A list of tuples of reading, referral, assessment, urine test
    """
    return __get_view(user, crud.read_patient_readings)


def __get_view(user: dict, func: Callable, **kwargs) -> List[Any]:
    role = user["role"]
    user_id = int(user["userId"])
    if role == RoleEnum.ADMIN.value or role == RoleEnum.HCW.value:
        return func(**kwargs)
    elif role == RoleEnum.CHO.value:
        return func(user_id=user_id, is_cho=True, **kwargs)
    elif role == RoleEnum.VHT.value:
        return func(user_id=user_id, **kwargs)
    else:
        raise ValueError("User has an invalid role.")
