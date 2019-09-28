# This module contains all Patient-related processing.

import logging

from models import Reading, ReadingSchema
from config import db

def create_reading(reading_data, patient_id):
    reading_data['patientId'] = patient_id

    # Add a new patient to db
    schema = ReadingSchema()
    new_reading = schema.load(reading_data, session=db.session)

    db.session.add(new_reading)
    db.session.commit()

    # Return the newly created reading object
    return new_reading