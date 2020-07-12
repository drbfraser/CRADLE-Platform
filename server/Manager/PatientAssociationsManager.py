from Database.PatientAssociationsRepo import PatientAssociationsRepo
from Manager.Manager import Manager
from models import Patient, HealthFacility, User, PatientAssociations
from typing import List


class PatientAssociationsManager(Manager):
    def __init__(self):
        Manager.__init__(self, PatientAssociationsRepo)

    def associate(
        self, patient: Patient, facility: HealthFacility, user: User
    ) -> PatientAssociations:
        """
        Creates a 3-way association between a patient, facility, and user by adding a
        new row to the database.

        :param patient: a patient
        :param facility: a facility
        :param user: a user
        :except IntegrityError: if an existing entry already exists in the database
        :return: an association object
        """
        associations = PatientAssociations(
            patientId=patient.patientId,
            healthFacilityName=facility.healthFacilityName,
            userId=user.id,
        )
        self.database.add(associations)
        return associations


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
