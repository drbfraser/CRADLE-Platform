# This module contains all Patient-related processing.

import logging

from models import Patient, PatientSchema
from config import db

def create_patient(patient_data):
    print(patient_data)
    # Add a new patient to db
    schema = PatientSchema()
    new_patient = schema.load(patient_data['personal-info'], session=db.session)

    db.session.add(new_patient)
    db.session.commit()

    # Return the newly created patient
    return schema.dump(new_patient)

def get_patient(patient_id):
    patient = Patient.query.filter_by(patientId=patient_id).one_or_none()
    if patient:
        return patient
    return None

def get_patients():
    patients = Patient.query.all()
    if patients:
        return patients
    return None

def update_info(id, request_body):
    logging.debug('Reached PatientManager')

    # TODO: Implement!
    # Build the response body:
    # response_body = {'you sent': body}

    return request_body
