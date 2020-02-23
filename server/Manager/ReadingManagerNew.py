from Database.ReadingRepoNew import ReadingRepo
from Manager.Manager import Manager
from Manager import patientManager
from Manager.urineTestManager import urineTestManager
import logging
urineTestManager = urineTestManager()

# reember to account for scenerio where there is no urine test reading
class ReadingManager(Manager):
    def __init__(self):
        Manager.__init__(self, ReadingRepo)

    def create_reading_and_patient(self, patient_id, patient_reading_data):
        patient = patientManager.read("patientId", patient_id)
        if patient is None:
            patient = patientManager.create(patient_reading_data['patient'])
        
        patient_reading_data['reading']['patientId'] = patient_id
        
        # creating new reading and saving urine test data on the side for creation later 
        urineTestData = patient_reading_data['reading']['urineTests']
        del patient_reading_data['reading']['urineTests'] 
        reading = self.create(patient_reading_data['reading'])


        # if a urine test already exits for reading, throw an error, otherwise create the urine test reading 
        existingReading = urineTestManager.read("readingId", reading['readingId'])
        if existingReading is None:
            urineTests = urineTestManager.create(urineTestData)
            logging.debug("urine test created")
            reading['urineTests'] = urineTests
            return {
                'reading': reading,
                'patient': patient
            }
        else:
            logging.debug("urine test not created")
            return "Reading Exists"