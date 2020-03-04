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

    def add_patient_facility_relationship(self,patient_reading_data):
        # add patient to facility
        # add patient to the facility of the user that took their reading
        try: 
            user = userManager.read("id", patient_reading_data['reading']['userId'])
            userFacility = user['healthFacilityName']
            patient_facility_to_insert = {
                "id": str(uuid.uuid4()),
                "patientId": patient_reading_data['patient']['patientId'],
                "healthFacilityName": userFacility
            }
            self.create(patient_facility_to_insert)
        except IntegrityError:
            # caught duplicte entry
            logging.debug('Duplicate entry for patient belonging to a facility')