# This module contains all Patient-related processing.

import collections
import logging

from Database import PatientRepository, PatientRepositoryMysql
from models import Patient, PatientSchema

database = PatientRepositoryMysql.PatientRepositoryMysql()

def create_patient(patient_data):
    new_patient = database.add_new_patient(patient_data)
    if isinstance(new_patient, collections.Mapping):
        return new_patient
    return database.model_to_dict(new_patient)  # Conversion from SQLAlchemy Model object

def get_patient(patient_id):
    return database.get(patient_id)

def get_patients():
    return database.get_all()

def update_info(id, request_body):
    logging.debug('Reached PatientManager')

    # TODO: Implement!
    # Build the response body:
    # response_body = {'you sent': body}

    return request_body
