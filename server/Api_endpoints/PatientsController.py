from flask import request
from flask_restful import Resource, abort
from models import Patient, PatientSchema
from config import db

def abort_if_patient_doesnt_exist(patient_id):
    patient = Patient.query.filter_by(id=patient_id).one_or_none()

    if patient is None:
        abort(404, message="Patient {} doesn't exist".format(patient_id))
    else:
        return patient

def abort_if_patients_doesnt_exist():
    patients = Patient.query.all()

    if patients is None:
        abort(404, message="No Patients")
    else:
        return patients

def abort_if_patient_exists(patient_id):
    patient = Patient.query.filter_by(id=patient_id).one_or_none()

    if patient:
        abort(404, message="Patient {} already exists".format(patient_id))


# /patient/<int:id> [GET]
class PatientInfo(Resource):
    def get(self, id):
        patient = abort_if_patient_doesnt_exist(id)

        patient_schema = PatientSchema()
        data = patient_schema.dump(patient)
        return data

# /patient [GET, POST]
class PatientApi(Resource):
    def get(self):
        patients = abort_if_patients_doesnt_exist()

        patient_schema = PatientSchema(many=True)
        data = patient_schema.dump(patients)
        return data

    # Create a new patient
    def post(self):
        patient_data = request.get_json()

        abort_if_patient_exists(patient_data['id'])

        # Add a new patient to db
        schema = PatientSchema()
        new_patient = schema.load(patient_data, session=db.session)

        db.session.add(new_patient)
        db.session.commit()

        # return the newly created patient
        data = schema.dump(new_patient)
        return data, 201