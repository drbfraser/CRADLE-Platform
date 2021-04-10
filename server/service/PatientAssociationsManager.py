from models import Patient, HealthFacility, User, PatientAssociations
from typing import List
import data.crud as crud


class PatientAssociationsManager:
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
        crud.create(associations)
        return associations

   