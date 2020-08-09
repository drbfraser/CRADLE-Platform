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

patientManager = PatientManagerNew()
readingManager = ReadingManagerNew()
userManager = UserManager()

urineTestManager = urineTestManager()
decoding_error = "The json body could not be decoded. Try enclosing appropriate fields with quotations, or ensuring that values are comma separated."


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
            return []
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
