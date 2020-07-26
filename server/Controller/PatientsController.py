from datetime import date, datetime
import json
import logging
import time

from flasgger import swag_from
from flask import request
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from flask_restful import Resource, abort
from sqlalchemy.exc import IntegrityError

from Controller.Helpers import _get_request_body
from Manager.PatientAssociationsManager import PatientAssociationsManager
from Manager.PatientManagerNew import PatientManager as PatientManagerNew
from Manager.ReadingManagerNew import ReadingManager as ReadingManagerNew
from Manager.UserManager import UserManager
from Manager.urineTestManager import urineTestManager
from Validation import PatientValidation

patientManager = PatientManagerNew()
readingManager = ReadingManagerNew()
userManager = UserManager()

urineTestManager = urineTestManager()
decoding_error = "The json body could not be decoded. Try enclosing appropriate fields with quotations, or ensuring that values are comma separated."


def abort_if_body_empty(request_body):
    if request_body is None:
        abort(400, message="The request body cannot be empty.")


def abort_if_patient_doesnt_exist(patient_id):
    patient = patientManager.read("patientId", patient_id)

    if patient is None:
        abort(404, message="Patient {} doesn't exist.".format(patient_id))
    else:
        return patient


def abort_if_patient_exists(patient_id):
    patient = patientManager.read("patientId", patient_id)

    if patient:
        abort(400, message="Patient {} already exists.".format(patient_id))


# input: timestamp (int)
# output: patient data w/ age populated (int)
def calculate_age_from_dob(patient_data):
    today = date.today()
    birthday = datetime.strptime(patient_data["dob"], "%Y-%m-%d").date()
    age = (
        today.year
        - birthday.year
        - ((today.month, today.day) < (birthday.month, birthday.day))
    )
    patient_data["patientAge"] = int(age)
    return patient_data


# URI: /api/patient [Get, Post]
# [GET]: Get a list of patients
# [POST]: Create a new patient
class PatientAll(Resource):
    @staticmethod
    def _get_request_body():
        raw_req_body = request.get_json(force=True)
        if "patient" in raw_req_body:
            body = raw_req_body["patient"]
        else:
            body = raw_req_body
        print("Request body: " + json.dumps(body, indent=2, sort_keys=True))
        return body

    # Get list of all patients
    @staticmethod
    @jwt_required
    @swag_from("../specifications/patient-all.yml", methods=["GET"])
    def get():
        logging.debug("Received request: GET /patient")

        patients = patientManager.read_all()
        if patients is None:
            abort(404, message="No patients currently exist.")
        return patients

    # Create a new patient
    @jwt_required
    @swag_from("../specifications/patient-post.yml", methods=["POST"])
    def post(self):
        logging.debug("Received request: POST /patient")
        try:
            patient_data = self._get_request_body()
        except:
            return {"HTTP 400": decoding_error}, 400
        patient_data = self._get_request_body()

        # Ensure all data is valid
        abort_if_body_empty(patient_data)
        abort_if_patient_exists(patient_data["patientId"])
        invalid = PatientValidation.check_patient_fields(patient_data)
        if invalid is not None:
            return {"HTTP 400": invalid}, 400

        # if age is not provided, populate age using dob
        if (
            "dob" in patient_data
            and patient_data["dob"]
            and ("patientAge" not in patient_data or patient_data["patientAge"] is None)
        ):
            patient_data = calculate_age_from_dob(patient_data)
        response_body = patientManager.create(patient_data)
        return response_body, 201

    @staticmethod
    @jwt_required
    def delete():
        patientManager.delete_all()
        return {}


# URI: api/patient/<string:patient_id>
# [GET]: Get a specific patient's information
# [PUT]: Update a specific patient's information
class PatientInfo(Resource):

    # Get a single patient
    @jwt_required
    @swag_from("../specifications/patient-get.yml", methods=["GET"])
    def get(self, patient_id):
        logging.debug("Received request: GET /patient/" + patient_id)
        patient = patientManager.read("patientId", patient_id)

        if patient is None:
            abort(404, message="Patient {} doesn't exist.".format(patient_id))
        return patient

    # Update patient info
    @jwt_required
    @swag_from("../specifications/patient-put.yml", methods=["PUT"])
    def put(self, patient_id):
        logging.debug("Received request: PUT /patient/" + patient_id)

        data = _get_request_body()

        patient = abort_if_patient_doesnt_exist(patient_id)
        invalid = PatientValidation.update_info_invalid(patient_id, data)
        if invalid is not None:
            return invalid

        response_body = patientManager.update("patientId", patient_id, data)

        return response_body, 200


# URI: api/patient/reading/:id [POST]
# [GET]: Get a patient's information w/ reading information
# [POST]: Create a new patient with a reading
class PatientReading(Resource):
    # Get a single patient
    @jwt_required
    def get(self, patient_id):
        logging.debug("Received request: GET /patient/" + patient_id)
        patient = patientManager.read("patientId", patient_id)
        if patient is None:
            abort(404, message="Patient {} doesn't exist.".format(patient_id))
        new_readings_array = []
        for reading in patient["readings"]:
            new_reading = readingManager.get_reading_json_from_reading(reading)
            new_readings_array.append(new_reading)

        patient["readings"] = new_readings_array
        return patient

    # Create a new patient with a reading
    @jwt_required
    @swag_from("../specifications/patient-reading-post.yml", methods=["POST"])
    def post(self):
        logging.debug("Received request: POST api/patient/reading")
        try:
            patient_reading_data = _get_request_body()
        except:
            return {"HTTP 400": decoding_error}, 400
        patient_reading_data = _get_request_body()
        # Ensure all data is valid
        abort_if_body_empty(patient_reading_data)
        is_invalid_patient = PatientValidation.check_patient_fields(
            patient_reading_data["patient"]
        )
        is_invalid_reading = PatientValidation.check_reading_fields(
            patient_reading_data["reading"]
        )

        if is_invalid_patient is not None:
            return {"HTTP 400": is_invalid_patient}, 400

        # validate with new reading validator
        if is_invalid_reading is not None:
            return {"HTTP 400": is_invalid_reading}, 400

        patient_data = patient_reading_data["patient"]
        if (
            "dob" in patient_data
            and patient_data["dob"]
            and ("patientAge" not in patient_data or patient_data["patientAge"] is None)
        ):
            patient_reading_data["patient"] = calculate_age_from_dob(patient_data)

        # create new reading (and patient if it does not already exist)
        reading_and_patient = readingManager.create_reading_and_patient(
            patient_reading_data["patient"]["patientId"], patient_reading_data
        )

        # add patient to the facility of the user that took their reading
        user_id = patient_reading_data["reading"]["userId"]
        user = userManager.database.select_one(id=user_id)
        facility_name = user.healthFacilityName
        patient_id = patient_reading_data["patient"]["patientId"]
        try:
            PatientAssociationsManager().associate_by_id(
                patient_id, facility_name, user_id
            )
        except IntegrityError:
            abort(409, message="Duplicate entry")

        # associate new reading with patient
        reading_and_patient["message"] = "Patient reading created successfully!"

        return reading_and_patient, 201


# URI: api/patient/allinfo
# [GET]: Get a list of ALL patients and their information (info, readings, referrals)
class PatientAllInformation(Resource):

    # get all patient information (patientinfo, readings, and referrals)
    @jwt_required
    def get(self):
        current_user = get_jwt_identity()
        try:
            patients_readings_referrals = patientManager.get_patient_with_referral_and_reading(
                current_user
            )
            # patients_readings_referrals = patientManager.get_patient_with_referral_and_reading()
        except PermissionError as permission_error:
            abort(401, message="{}".format(permission_error))

        if not patients_readings_referrals:
            return []
        else:
            return patients_readings_referrals


# URI: api/patient/global/<string:search>
# [GET]: Get a list of ALL patients and their basic information
#        (information necessary for the patient page)
#        if they match search criteria
#        For now search criteria could be:
#           a portion/full match of the patient's id
#           a portion/full match of the patient's initials
class PatientGlobalSearch(Resource):

    # get all patient information (patientinfo, readings, and referrals)
    @jwt_required
    def get(self, search):
        current_user = get_jwt_identity()
        patients_readings_referrals = patientManager.get_global_search_patients(
            current_user, search.upper()
        )

        if not patients_readings_referrals:
            abort(
                404, message="No patients matching the search criteria currently exist."
            )
        else:
            return patients_readings_referrals


# URI: api/patient/facility
# [POST]: Add patient to a facility

# URI: /api/patient/facility
# [POST]: Add patient to a facility
class PatientFacility(Resource):
    @jwt_required
    def post(self):
        import api.util as util
        import data.crud as crud
        import service.assoc as assoc
        from models import Patient

        try:
            request_body = _get_request_body()
        except:
            return {"HTTP 400": decoding_error}, 400
        if not request_body["patientId"]:
            return {"HTTP 400": "Patient Id is empty."}, 400

        # Emulate old API functionality with new systems, use of /api/associations is
        # preferred over this method now
        patient = crud.read(Patient, patientId=request_body["patientId"])
        if patient:
            user = util.current_user()
            facility = user.healthFacility
            if not assoc.has_association(patient, facility, user):
                assoc.associate(patient, facility, user)
            else:
                abort(409, message="Duplicate entry")
            return {"message": "patient has been added to facility successfully"}, 201
        else:
            abort(404, message="This patient does not exist.")
