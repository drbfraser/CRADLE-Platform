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

        patient = crud.read(Patient, patientId=patient_id)
        facility = crud.read(HealthFacility, healthFacilityName=facility_name)
        user = crud.read(User, id=user_id)

        if not patient or not facility or not user:
            raise ValueError("patient, facility, or user not found")
        return self.associate(patient, facility, user)
