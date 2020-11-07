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
from models import Patient, Referral, User, PatientAssociations


def patient_view_for_user(user: User, **kwargs) -> List[Patient]:
    """
    Switches on the role of ``user`` and returns an appropriate list of patients.

    :param user: The user to get patients for
    :param **kwargs: all the optional query values
    :return: A list of patients
    """
    roles = [r.name.value for r in user.roleIds]
    if "ADMIN" in roles:
        return admin_patient_view(**kwargs)
    elif "HCW" in roles:
        return admin_patient_view(**kwargs)
        # return hcw_patient_view(user)
    elif "CHO" in roles:
        return cho_patient_view(user, **kwargs)
    elif "VHT" in roles:
        return vht_patient_view(user, **kwargs)
    else:
        raise ValueError("user does not contain an roles")


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
        return crud.read_all_assoc_patients(PatientAssociations, user)
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
        return crud.read_all_assoc_patients(PatientAssociations, user)
    else:
        # getting information for patient table (VHT view)
        return crud.read_all_patients_for_user(user, **kwargs)


def referral_view_for_user(user: User, **kwargs) -> List[Referral]:
    """
    Switches on the role of ``user`` and returns an appropriate list of referrals.

    :param user: The user to get referrals for
    :return: A list of referrals
    """
    roles = [r.name.value for r in user.roleIds]
    if "ADMIN" in roles:
        return admin_referral_view(**kwargs)
    elif "HCW" in roles:
        return admin_referral_view(**kwargs)
        # return hcw_referral_view(user)
    elif "CHO" in roles:
        return cho_referral_view(user, **kwargs)
    elif "VHT" in roles:
        # could check if individual vht referral is needed here
        return vht_referral_view(user, **kwargs)
    else:
        raise ValueError("user does not contain any roles")


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
