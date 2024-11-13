"""
The ``service.assoc`` module provides functions for managing associations between
patients, health facilities, and users.
"""

from typing import List

from data import crud
from enums import RoleEnum
from models import HealthFacilityOrm, PatientAssociationsOrm, PatientOrm, UserOrm


def associate_by_user_role(patient: PatientOrm, user: UserOrm):
    """
    Creates a patient association based on a user's role.

    If the user is a HCW, then an association is made between the user's facility
    (i.e., the one they work at) and the patient. If the user has a different role
    (e.g., a VHT) then an association is made between the patient and the user.

    For more control over what kind of association is made, use the ``associate``
    function instead.

    An association won't be created if one already exists between the two parties.

    :param patient: A patient
    :param user: The user making the association
    """
    if user.role == RoleEnum.HCW.value:
        if not has_association(patient, facility=user.health_facility):
            associate(patient, facility=user.health_facility)
    elif not has_association(patient, user=user):
        associate(patient, user=user)


def associate(
    patient: PatientOrm, facility: HealthFacilityOrm = None, user: UserOrm = None
):
    """
    Creates an association between a patient and facility, patient and user, or patient,
    user and facility.

    :param patient: A patient
    :param facility: A facility
    :param user: A user
    :except IntegrityError: If an existing entry already exists in the database
    """
    if not facility and not user:
        raise ValueError("either a facility or user must be provided")

    association = PatientAssociationsOrm(
        patient_id=patient.id,
        health_facility_name=facility.name if facility else None,
        user_id=user.id if user else None,
    )
    crud.create(association)


def associate_by_id(
    patient_id: str,
    facility_name: str,
    user_id: int,
) -> PatientAssociationsOrm:
    """
    Creates a 3-way association between a patient, facility, and a user identified
    by their respective identifiers.

    :param patient_id: A patient id
    :param facility_name: A facility name
    :param user_id: A user id
    :except IntegrityError: If an existing entry already exists in the database
    :except ValueError: If any of the identifiers don't identify a value
    :return: An association object
    """
    patient = crud.read(PatientOrm, id=patient_id)
    facility = crud.read(HealthFacilityOrm, name=facility_name)
    user = crud.read(UserOrm, id=user_id)

    if not patient or not facility or not user:
        raise ValueError("patient, facility, or user not found")
    return associate(patient, facility, user)


def has_association(
    patient: PatientOrm = None,
    facility: HealthFacilityOrm = None,
    user: UserOrm = None,
) -> bool:
    """
    Returns true if the supplied models are associated with one another.

    :param patient: A patient model
    :param facility: A facility model
    :param user: A user model
    :return: True if there is an association between the objects, otherwise False
    """
    return has_association_by_id(
        patient.id if patient else None,
        facility.name if facility else None,
        user.id if user else None,
    )


def has_association_by_id(
    patient_id: str = None,
    facility_name: str = None,
    user_id: int = None,
) -> bool:
    """
    Returns true if the supplied models are associated with one another.

    :param patient_id: A patient id
    :param facility_name: A facility name
    :param user_id: A user id
    :return: True if there is an association between the objects, otherwise False
    """
    kw = dict()
    if patient_id:
        kw["patient_id"] = patient_id
    if facility_name:
        kw["health_facility_name"] = facility_name
    if user_id:
        kw["user_id"] = user_id
    if not kw:
        raise TypeError("at least one keyword argument is required")
    return crud.read_all(PatientAssociationsOrm, **kw) != []


def patients_for_user(user: UserOrm) -> List[PatientOrm]:
    """
    Returns a list of distinct patients associated with a given user.

    :param user: A ``User`` model
    :return: A list of patients
    """
    patients = [a.patient for a in user.associations]
    return list(dict.fromkeys(patients))


def patients_at_facility(facility: HealthFacilityOrm) -> List[PatientOrm]:
    """
    Return a list of distinct patients associated with a given health facility.

    :param facility: A ``HealthFacility`` model
    :return: A list of patients
    """
    patients = [a.patient for a in facility.associations]
    return list(dict.fromkeys(patients))
