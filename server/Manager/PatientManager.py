# This module contains all Patient-related processing.

import logging

from Database import PatientRepository, PatientRepositoryMysql
from models import Patient, PatientSchema

database = PatientRepositoryMysql.PatientRepositoryMysql()

def create_patient(patient_data):
    return database.add_new_patient(patient_data)

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

def delete_all():
    return database.delete_all()