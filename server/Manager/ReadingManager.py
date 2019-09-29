# This module contains all Patient-related processing.

from Database import ReadingRepositoryMysql, PatientRepositoryMysql
from models import ReadingSchema, PatientSchema

readingDatabase = ReadingRepositoryMysql.ReadingRepositoryMysql()
patientDatabase = PatientRepositoryMysql.PatientRepositoryMysql()


def create_reading(patient_id, patient_reading_data):
    # check if patient is already created
    patient = patientDatabase.get(patient_id)
    if patient is None:
        patient = patientDatabase.add_new_patient(patient_reading_data['patient'])

    reading = readingDatabase.add_new_reading(patient_id, patient_reading_data['reading'])

    return {
        'reading': ReadingSchema().dump(reading),
        'patient': PatientSchema().dump(patient)
    }
