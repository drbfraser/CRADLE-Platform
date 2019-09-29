from Database.PatientRepository import PatientRepository
from config import db
from models import PatientSchema, Patient, ReadingSchema


class ReadingRepositoryMysql:
    def __init__(self):
        pass

    @staticmethod
    def model_to_dict(model):
        return PatientSchema().dump(model)

    @staticmethod
    def add_new_reading(patient_id, reading_data):
        reading_data['patientId'] = patient_id

        # Add a new patient to db
        schema = ReadingSchema()
        new_reading = schema.load(reading_data, session=db.session)

        db.session.add(new_reading)
        db.session.commit()

        # Return the newly created reading object
        return new_reading
