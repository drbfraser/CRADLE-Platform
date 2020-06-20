import uuid
import logging
from sqlalchemy.exc import IntegrityError
from Database.PatientFacilityRepo import PatientFacilityRepo
from Manager.Manager import Manager
from Manager.UserManager import UserManager

userManager = UserManager()


class PatientFacilityManager(Manager):
    def __init__(self):
        Manager.__init__(self, PatientFacilityRepo)

    def add_patient_facility_relationship(self, patientId, healthFacilityName):
        # add patient to facility
        # add patient to the facility of the user that took their reading
        try:
            patient_facility_to_insert = {
                "id": str(uuid.uuid4()),
                "patientId": patientId,
                "healthFacilityName": healthFacilityName,
            }
            self.create(patient_facility_to_insert)
        except IntegrityError:
            # caught duplicte entry or facility that does not exist 
            logging.debug("Duplicate entry, or facility does not exist")
            raise Exception("This patient either already belongs to this facility, or the facility does not exist")
