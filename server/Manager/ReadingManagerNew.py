from Database.ReadingRepoNew import ReadingRepo
from Manager.Manager import Manager

from Manager import patientManager

class ReadingManager(Manager):
    def __init__(self):
        Manager.__init__(self, ReadingRepo)

    def create_reading_and_patient(self, patient_id, patient_reading_data):
        patient = patientManager.read("patientId", patient_id)
        if patient is None:
            patient = patientManager.create(patient_reading_data['patient'])
        
        patient_reading_data['reading']['patientId'] = patient_id

        reading = self.create(patient_reading_data['reading'])

        return {
            'reading': reading,
            'patient': patient
        }