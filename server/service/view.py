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

from typing import List

import data.crud as crud
import service.assoc as assoc
from models import (
    MedicalRecord,
    Patient,
    Referral,
    RoleEnum,
    User,
    PatientAssociations,
    Pregnancy,
)


def patient_view_for_user(user: User, **kwargs) -> List[Patient]:
    """
    Switches on the role of ``user`` and returns an appropriate list of patients.

    :param user: The user to get patients for
    :param **kwargs: all the optional query values
    :return: A list of patients
    """

    role = user.role
    if role == RoleEnum.ADMIN.value:
        return admin_patient_view(**kwargs)
    elif role == RoleEnum.HCW.value:
        return admin_patient_view(**kwargs)
        # return hcw_patient_view(user)
    elif role == RoleEnum.CHO.value:
        return cho_patient_view(user, **kwargs)
    elif role == RoleEnum.VHT.value:
        # could check if individual vht referral is needed here
        return vht_patient_view(user, **kwargs)
    else:
        raise ValueError("User has an invalid role")


def admin_patient_view(**kwargs) -> List[Patient]:
    """
    Returns the admin patient view (i.e., all patients).

    :return: A list of patients (filtered based on the parameters)
    """
    if not kwargs:
        # getting all the patient + readings + followups + urine tests
        return crud.read_all(Patient)
    else:
        # getting information for patient table (Admin view)
        return crud.read_all_admin_view(Patient, **kwargs)


def hcw_patient_view(user: User) -> List[Patient]:
    """
    Returns the HCW patient view for a given user.

    :param user: The user to get patients for
    :return: A list of patients
    """
    return assoc.patients_at_facility(user.healthFacility)


def cho_patient_view(user: User, **kwargs) -> List[Patient]:
    """
    Returns the CHO patient view for a given user.

    :param user: The user to get patients for
    :return: A list of patients
    """
    if not kwargs:
        # patient + readings + followups + urine tests
        # only for the CHO associated patients
        return crud.read_all_assoc_patients(PatientAssociations, user, True)
    else:
        # getting information for patient table (CHO view)
        vht_and_cho_patients = crud.read_all_patients_for_assoc_vht(user, **kwargs)
        return vht_and_cho_patients


def vht_patient_view(user: User, **kwargs) -> List[Patient]:
    """
    Returns the VHT patient view for a given usr.

    :param user: The user to get patients for
    :return: A list of patients (filtered based on the parameters)
    """
    if not kwargs:
        # patient + readings + followups + urine tests
        # only for the VHT associated patients
        return crud.read_all_assoc_patients(PatientAssociations, user, False)
    else:
        # getting information for patient table (VHT view)
        return crud.read_all_patients_for_user(user, **kwargs)


def referral_view_for_user(user: User, **kwargs) -> List[Referral]:
    """
    Switches on the role of ``user`` and returns an appropriate list of referrals.

    :param user: The user to get referrals for
    :return: A list of referrals
    """
    role = user.role
    if role == RoleEnum.ADMIN.value:
        return admin_referral_view(**kwargs)
    elif role == RoleEnum.HCW.value:
        return admin_referral_view(**kwargs)
        # return hcw_referral_view(user)
    elif role == RoleEnum.CHO.value:
        return cho_referral_view(user, **kwargs)
    elif role == RoleEnum.VHT.value:
        # could check if individual vht referral is needed here
        return vht_referral_view(user, **kwargs)
    else:
        raise ValueError("User has an invalid role")


def admin_referral_view(**kwargs) -> List[Referral]:
    """
    Returns the Admin referral view (i.e., all referrals).

    :return: All referrals in the database
    """
    if not kwargs:
        return crud.read_all(Referral)
    else:
        # getting information for Referral table (Admin view)
        return crud.read_all_admin_view(Referral, **kwargs)


def hcw_referral_view(user: User) -> List[Referral]:
    """
    Returns the HCW referral view of a given user.

    :param user: The user to get referrals for
    :return: A list of referrals
    """
    return user.healthFacility.referrals


def cho_referral_view(user: User, **kwargs) -> List[Referral]:
    """
    Returns the CHO referral view of a given user.

    :param user: The user to get referrals for
    :return: A list of referrals
    """

    if not kwargs:
        cho_referrals = user.referrals
        vht_referrals = [r for vht in user.vhtList for r in vht_referral_view(vht)]
        return cho_referrals + vht_referrals
    else:
        # getting information for Referral table (CHO view)
        return crud.read_all_referral_for_user(user, **kwargs)


def vht_referral_view(user: User, **kwargs) -> List[Referral]:
    """
    Returns the VHT referral view of a given user.
    VHTs should be able to see all referrals sent to the health facility they operate at

    :param user: The user to get referrals for
    :return: A list of referrals (filtered based on the parameters)
    """
    if not kwargs:
        return user.healthFacility.referrals
    else:
        # getting information for Referral table (VHT view)
        return crud.read_all_referral_for_user(user, **kwargs)


def individual_vht_referral_view(user: User) -> List[Referral]:
    """
    Returns the VHT referral view of a given user.

    :param user: The user to get referrals for
    :return: A list of referrals
    """
    return user.referrals


def referral_view(user: dict, **kwargs) -> List[Referral]:
    """
    Returns a list of referrals filtered by query criteria in keyword arguments.

    :param user: JWT identity
    :param **kwargs: Optional query criteria
    :return: A list of referrals
    """
    role = user["role"]
    if role == RoleEnum.ADMIN.value or role == RoleEnum.HCW.value:
        return crud.read_referrals(**kwargs)
    else:
        user_id = user["userId"]
        if user_id:
            return crud.read_referrals([user_id], **kwargs)


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


def mobile_patient_and_reading_view(user: dict) -> tuple:
    """
    Returns a list of patients and a list of readings associated with the user.

    :param user: JWT identity
    :return: A tuple of two lists
    """
    role = user["role"]
    if role == RoleEnum.ADMIN.value or role == RoleEnum.HCW.value:
        patients = crud.read_mobile_patients()
        readings = crud.read_all_readings_db(True, None)
        return patients, readings
    else:
        user_id = user["userId"]
        if user_id:
            patients = crud.read_mobile_patients(user_id)
            readings = crud.read_all_readings_db(False, user_id)
            return patients, readings
