"""
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
from models import Patient, User


def patient_view_for_user(user: User) -> List[Patient]:
    """
    Switches on the role of ``user`` and returns an appropriate list of patients.

    :param user: The user to get patients for
    :return: A list of patients
    """
    roles = [r.name.value for r in user.roleIds]
    if "ADMIN" in roles:
        return admin_patient_view()
    elif "HCW" in roles:
        return hwc_patient_view(user)
    elif "CHO" in roles:
        return cho_patient_view(user)
    elif "VHT" in roles:
        return vht_patient_view(user)
    else:
        raise ValueError("user does not contain an roles")


def admin_patient_view() -> List[Patient]:
    """
    Returns the admin patient view (i.e., all patients).

    :return: A list of patients
    """
    return crud.read_all(Patient)


def hwc_patient_view(user: User) -> List[Patient]:
    """
    Returns the HCW patient view for a given user.

    :param user: The user to get patients for
    :return: A list of patients
    """
    return assoc.patients_at_facility(user.healthFacility)


def cho_patient_view(user: User) -> List[Patient]:
    """
    Returns the CHO patient view for a given user.

    :param user: The user to get patients for
    :return: A list of patients
    """
    cho_patients = assoc.patients_for_user(user)
    vht_patients = [u for vht in user.vhtList for u in assoc.patients_for_user(vht)]
    return cho_patients + vht_patients


def vht_patient_view(user: User) -> List[Patient]:
    """
    Returns the VHT patient view for a given usr.

    :param user: The user to get patients for
    :return: A list of patients
    """
    return assoc.patients_for_user(user)
