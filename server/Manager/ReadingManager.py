# This module contains all Patient-related processing.

from Database import ReadingRepositoryMysql, PatientRepositoryMysql
from models import ReadingSchema, PatientSchema

readingDatabase = ReadingRepositoryMysql.ReadingRepositoryMysql()
patientDatabase = PatientRepositoryMysql.PatientRepositoryMysql()


def create_reading_and_patient(patient_id, patient_reading_data):
    # check if patient is already created
    patient = patientDatabase.get(patient_id)
    if patient is None:
        patient = patientDatabase.add_new_patient(patient_reading_data['patient'])
        
    patient_reading_data['reading']['patientId'] = patient_id

    reading = readingDatabase.add_new_reading(patient_reading_data['reading'])

    return {
        'reading': ReadingSchema().dump(reading),
        'patient': PatientSchema().dump(patient)
    }

def create_reading(reading_data):
    reading = readingDatabase.add_new_reading(reading_data)
    return ReadingSchema().dump(reading)
