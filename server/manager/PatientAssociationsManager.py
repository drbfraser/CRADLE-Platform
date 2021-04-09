from database.PatientAssociationsRepo import PatientAssociationsRepo
from database.PatientRepo import PatientRepo
from database.HealthFacilityRepo import HealthFacilityRepo
from manager.Manager import Manager
from models import Patient, HealthFacility, User, PatientAssociations
from typing import List
import data.crud as crud



class PatientAssociationsManager(Manager):
    def __init__(self):
        Manager.__init__(self, PatientAssociationsRepo)
        self.patient_repo = PatientRepo()
        self.facility_repo = HealthFacilityRepo()

    def associate(
        self, patient: Patient, facility: HealthFacility, user: User
    ) -> PatientAssociations:
        """
        Creates a 3-way association between a patient, facility, and user by adding a
        new row to the database.

        :param patient: A patient
        :param facility: A facility
        :param user: A user
        :except IntegrityError: If an existing entry already exists in the database
        :return: An association object
        """
        associations = PatientAssociations(
            patientId=patient.patientId,
            healthFacilityName=facility.healthFacilityName,
            userId=user.id,
        )
        self.database.add(associations)
        return associations

    def associate_by_id(
        self, patient_id: str, facility_name: str, user_id: int
    ) -> PatientAssociations:
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
        patient = self.patient_repo.select_one(patientId=patient_id)
        facility = self.facility_repo.select_one(healthFacilityName=facility_name)
        user = crud.read(User, id=user_id)

        if not patient or not facility or not user:
            raise ValueError("patient, facility, or user not found")
        return self.associate(patient, facility, user)


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
    return PatientAssociations.query.filter_by(**kw).all() != []


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
