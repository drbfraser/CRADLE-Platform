import logging
import json
import uuid
from flask import request
from flask_restful import Resource, abort
from datetime import date, datetime
from Controller.Helpers import _get_request_body
import time

# Project modules
from Manager.PatientManagerNew import PatientManager as PatientManagerNew
from Manager.ReadingManagerNew import ReadingManager as ReadingManagerNew
from Validation import PatientValidation
from Manager.UserManager import UserManager
from Manager.PatientFacilityManager import PatientFacilityManager
from Manager.urineTestManager import urineTestManager

from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    jwt_refresh_token_required,
    get_jwt_identity,
)
from flasgger import swag_from

patientManager = PatientManagerNew()
readingManager = ReadingManagerNew()
userManager = UserManager()
patientFacilityManager = PatientFacilityManager()

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
    SECONDS_IN_YEAR = 31557600
    age = (time.time() - patient_data["dob"]) / SECONDS_IN_YEAR
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

        if "dob" in patient_data and patient_data["dob"] is not None:
            patient_data["dob"] = int(patient_data["dob"])

        # Ensure all data is valid
        abort_if_body_empty(patient_data)
        abort_if_patient_exists(patient_data["patientId"])
        invalid = PatientValidation.check_patient_fields(patient_data)
        if invalid is not None:
            return invalid

        # if age is not provided, populate age using dob
        if (
            "dob" in patient_data
            and patient_data["dob"]
            and patient_data["patientAge"] is None
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
    def get(self, patient_id):
        logging.debug("Received request: GET /patient/" + patient_id)
        patient = patientManager.read("patientId", patient_id)

        new_readings = []
        for reading in patient["readings"]:
            new_reading = readingManager.read("readingId", reading)
            new_reading["urineTests"] = urineTestManager.read("readingId", reading)
            new_readings.append(new_reading)
        patient["readings"] = new_readings

        if patient is None:
            abort(404, message="Patient {} doesn't exist.".format(patient_id))
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
            return is_invalid_patient

        # validate with new reading validator
        if is_invalid_reading is not None:
            return is_invalid_reading

        patient_data = patient_reading_data["patient"]
        if (
            "dob" in patient_data
            and patient_data["dob"]
            and patient_data["patientAge"] is None
        ):
            patient_reading_data["patient"]["dob"] = int(
                patient_reading_data["patient"]["dob"]
            )
            patient_reading_data["patient"] = calculate_age_from_dob(patient_data)

        # create new reading (and patient if it does not already exist)
        reading_and_patient = readingManager.create_reading_and_patient(
            patient_reading_data["patient"]["patientId"], patient_reading_data
        )

        # add patient to the facility of the user that took their reading
        user = userManager.read("id", patient_reading_data["reading"]["userId"])
        userFacility = user["healthFacilityName"]
        patientFacilityManager.add_patient_facility_relationship(
            patient_reading_data["patient"]["patientId"], userFacility
        )

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
        patients_readings_referrals = patientManager.get_patient_with_referral_and_reading(
            current_user
        )
        # patients_readings_referrals = patientManager.get_patient_with_referral_and_reading()

        if not patients_readings_referrals:
            abort(404, message="No patients currently exist.")
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

        # Only works for health workers currently
        if "HCW" not in current_user["roles"]:
            return (
                {"message": "Unauthorized, please try again as a Health Care Worker"},
                401,
            )

        patients_readings_referrals = patientManager.get_global_search_patients(
            current_user, search
        )

        if not patients_readings_referrals:
            abort(404, message="No patients currently exist.")
        else:
            return patients_readings_referrals


# URI: api/patient/facility
# [POST]: Add patient to a facility

# URI: /api/patient/facility/<string:patient_id>
# [POST]: Add patient to a facility
class PatientFacility(Resource):
    @jwt_required
    def post(self, patient_id):
        patient = patientManager.read("patientId", patient_id)
        if patient:
            current_user = get_jwt_identity()
            user_health_facility = current_user["healthFacilityName"]
            patientFacilityManager.add_patient_facility_relationship(
                patient_id, user_health_facility
            )
            return {"message": "patient has been added to facility successfully"}, 200
        else:
            abort(404, message="This patient does not exist.")
