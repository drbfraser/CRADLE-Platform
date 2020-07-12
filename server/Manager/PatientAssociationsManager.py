from Database.PatientAssociationsRepo import PatientAssociationsRepo
from Database.PatientRepoNew import PatientRepo
from Database.HealthFacilityRepoNew import HealthFacilityRepo
from Database.UserRepo import UserRepo
from Manager.Manager import Manager
from models import Patient, HealthFacility, User, PatientAssociations
from typing import List


class PatientAssociationsManager(Manager):
    def __init__(self):
        Manager.__init__(self, PatientAssociationsRepo)
        self.patient_repo = PatientRepo()
        self.facility_repo = HealthFacilityRepo()
        self.user_repo = UserRepo()

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
        user = self.user_repo.select_one(id=user_id)
        if not patient or not facility or not user:
            raise ValueError("patient, facility, or user not found")
        return self.associate(patient, facility, user)


def patients_for_user(user: User) -> List[Patient]:
    """
    Returns a list of distinct patients associated with a given user.

    :param user: A ``User`` model
    :return: A list of patients
    """
    associations = PatientAssociations.query.filter_by(userId=user.id).all()
    patients = [a.patient for a in associations]
    return list(dict.fromkeys(patients))


def patients_at_facility(facility: HealthFacility) -> List[Patient]:
    """
    Return a list of distinct patients associated with a given health facility.

    :param facility: A ``HealthFacility`` model
    :return: A list of patients
    """
    associations = PatientAssociations.query.filter_by(
        healthFacilityName=facility.healthFacilityName
    ).all()
    patients = [a.patient for a in associations]
    return list(dict.fromkeys(patients))
