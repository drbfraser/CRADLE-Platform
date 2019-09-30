# This module contains all Patient-related processing.

import collections
import logging

from Database import PatientRepository, PatientRepositoryMysql, PatientRepositoryLocal
from models import Patient, PatientSchema

database = PatientRepositoryMysql.PatientRepositoryMysql()
# database = PatientRepositoryLocal.PatientRepositoryLocal()

def create_patient(patient_data):
    new_patient = database.add_new_patient(patient_data)
    if isinstance(new_patient, collections.Mapping):  # Local database stub
        return new_patient
    return database.model_to_dict(new_patient)  # Conversion from SQLAlchemy Model object

def get_patient(patient_id):
    patient_data = database.get(patient_id)
    if patient_data is None:
        return None
    elif isinstance(patients, collections.Mapping):  # Local database stub
        return patients

    return PatientSchema().dump(patient)  # Conversion from SQLAlchemy Model object

def get_patients():
    patients = database.get_all()
    if patients is None:
        return None
    elif isinstance(patients, collections.Mapping):  # Local database stub
        return patients

    return PatientSchema(many=True).dump(patients)  # Conversion from SQLAlchemy Model object

def get_patients_object():
    patients = database.get_all()
    if patients is None:
        return None
    elif isinstance(patients, collections.Mapping):  # Local database stub
        return patients

    return patients

def update_info(id, request_body):
    logging.debug('Reached PatientManager')

    # TODO: Implement!
    # Build the response body:
    # response_body = {'you sent': body}

    return request_body

def delete_all():
    return database.delete_all()
