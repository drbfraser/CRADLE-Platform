from Database.PatientRepository import PatientRepository
from config import db
from models import PatientSchema, Patient


class PatientRepositoryMysql(PatientRepository):
    def __init__(self):
        pass

    def add_new_patient(self, patient_data):
        # Add a new patient to db
        schema = PatientSchema()
        new_patient = schema.load(patient_data, session=db.session)

        db.session.add(new_patient)
        db.session.commit()

        # Return the newly created patient
        return new_patient

    def get(self, patient_id):
        patient = Patient.query.filter_by(patientId=patient_id).one_or_none()
        if patient:
            return patient
        return None

    def get_all(self):
        patients = Patient.query.all()
        if patients:
            return patients
        return None
