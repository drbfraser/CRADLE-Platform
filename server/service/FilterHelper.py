from typing import List, Tuple

from models import Patient, User
from service.assoc import (
    has_association,
    patients_at_facility,
    patients_for_user,
)


def patients_for_hcw(user: User) -> List[Patient]:
    """
    Returns the list of patients that are associated with a health care worker.

    Patients are considered to be associated with a HCW if there is an association
    between the patient and the facility the HCW works at in the patient_associations
    table.

    :param user: A HCW user model
    :return: A list of patients
    """
    facility = user.healthFacility
    return patients_at_facility(facility)


def patients_for_cho(user: User) -> List[Patient]:
    """
    Returns the list of patients that are associated with a CHO.

    :param user: A CHO user model
    :return: A list of patients
    """
    cho_patients = patients_for_user(user)
    vht_patients = [u for vht in user.vhtList for u in patients_for_user(vht)]
    return cho_patients + vht_patients


def patients_for_vht(user: User) -> List[Patient]:
    """
    Returns the list of patients that are associated with a VHT.

    Patients are considered to be associated with a VHT if there is an association
    between the user and the patient in the patient_associations table.

    :param user: VHT user model
    :return: A list of patients
    """
    return patients_for_user(user)


def annotated_global_patient_list(
    user: User, search: str,
) -> List[Tuple[Patient, bool]]:
    """
    Returns the global list of patients where each patient is paired with a boolean that
    is True if the patient is a member of the user's health facility and False if not.

    :param user: A user model
    :param search: A search query
    :return: A list of tuples
    """

    def __normalized_search(query: str, value: str) -> bool:
        return query.upper() in value.upper()

    facility = user.healthFacility
    all_patients = Patient.query.all()
    return [
        (patient, has_association(patient=patient, facility=facility))
        for patient in all_patients
        if __normalized_search(search, patient.patientId)
        or __normalized_search(search, patient.patientName)
    ]
