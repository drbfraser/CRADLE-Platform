# This module contains all Patient-related processing.

import logging

from models import Patient, PatientSchema
from config import db

def create_patient(patientData):
    # Add a new patient to db
    schema = PatientSchema()
    new_patient = schema.load(patientData, session=db.session)

    db.session.add(new_patient)
    db.session.commit()

    # Return the newly created patient
    return schema.dump(new_patient)

def get_patient(id):
    return {'data':'value'}

def update_info(id, request_body):
    logging.debug('Reached PatientManager')

    # TODO: Implement!
    # Build the response body:
    # response_body = {'you sent': body}

    return request_body
