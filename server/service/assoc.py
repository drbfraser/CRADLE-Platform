"""
The ``service.assoc`` module provides functions for managing associations between
patients, health facilities, and users.
"""
from typing import List

import data.crud as crud
from models import Patient, PatientAssociations, HealthFacility, RoleEnum, User


def associate_by_user_role(patient: Patient, user: User):
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
        if not has_association(patient, facility=user.healthFacility):
            associate(patient, facility=user.healthFacility)
    else:
        if not has_association(patient, user=user):
            associate(patient, user=user)


def associate(patient: Patient, facility: HealthFacility = None, user: User = None):
    """
    Creates an association between a patient and facility, patient and user, or patient,
    user and facility.

    :param patient: A patient
    :param facility: A facility
    :param user: A user
    :except IntegrityError: If an existing entry already exists in the database
    """
    if not facility and not user:
        raise ValueError(f"either a facility or user must be provided")

    association = PatientAssociations(
        patientId=patient.patientId,
        healthFacilityName=facility.healthFacilityName if facility else None,
        userId=user.id if user else None,
    )
    crud.create(association)


def has_association(
    patient: Patient = None, facility: HealthFacility = None, user: User = None
) -> bool:
    """
    Returns true if the supplied models are associated with one another.

    :param patient: A patient model
    :param facility: A facility model
    :param user: A user model
    :return: True if there is an association between the objects, otherwise False
    """
    return has_association_by_id(
        patient.patientId if patient else None,
        facility.healthFacilityName if facility else None,
        user.id if user else None,
    )


def has_association_by_id(
    patient_id: str = None, facility_name: str = None, user_id: int = None
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
        kw["patientId"] = patient_id
    if facility_name:
        kw["healthFacilityName"] = facility_name
    if user_id:
        kw["userId"] = user_id
    if not kw:
        raise TypeError("at least one keyword argument is required")
    return crud.read_all(PatientAssociations, **kw) != []


def patients_for_user(user: User) -> List[Patient]:
    """
    Returns a list of distinct patients associated with a given user.

    :param user: A ``User`` model
    :return: A list of patients
    """
    patients = [a.patient for a in user.associations]
    return list(dict.fromkeys(patients))


def patients_at_facility(facility: HealthFacility) -> List[Patient]:
    """
    Return a list of distinct patients associated with a given health facility.

    :param facility: A ``HealthFacility`` model
    :return: A list of patients
    """
    patients = [a.patient for a in facility.associations]
    return list(dict.fromkeys(patients))
