import json
from flask import request
from flask_restful import Resource, abort
from config import db
from utils import pprint

# Project modules
from models import Referral, ReferralSchema
from models import User, Patient, HealthFacility, Reading, FollowUp
from Manager.ReadingManager import *
from Manager.PatientManager import *
from Manager.HealthFacilityManagerOld import *

from Manager.ReferralManager import ReferralManager

from Validation.ReferralValidator import ReferralValidator

referralManager = ReferralManager()
validator = ReferralValidator()

def abort_if_referral_doesnt_exist(referral_id):
    referral = referralManager.read("id", referral_id)
    if referral is None:
        abort(404, message="Referral {} doesn't exist".format(referral_id))
    else:
        return referral

def abort_if_referrals_doesnt_exist():
    referrals = referralManager.read_all()
    if referrals is None:
        abort(404, message="No referrals")
    else:
        return referrals

def abort_if_referral_exists(referral_id):
    referral = Referral.query.filter_by(id=referral_id).one_or_none()
    referral = referralManager.read("id", referral_id)
    if referral:
        abort(400, message="Referral {} already exists".format(referral_id))

""" Returns a single referral matching the inputted id
    urlParams:
        id: id/primary key of referral
    returns:
        single referral matching submitted id
"""
# /referral/<int:id> [GET]
class ReferralInfo(Resource):
    def get(self, id):
        referral = abort_if_referral_doesnt_exist(id)
        return referral

# /referral [GET, POST]
class ReferralApi(Resource):
    @staticmethod
    def _get_request_body():
        raw_req_body = request.get_json(force=True)
        body = raw_req_body
        print('Request body: ' + json.dumps(body, indent=2, sort_keys=True))
        return body

    """ Get Referrals
        queryParams (Optional):
            - healthFacilityId
            - userId
            - patientId
        Description:    
            if query params are supplied, 
            all referrals that match the given query params are return
            else, all referrals are returned
    """
    def get(self):
        # NEEDS TESTING and query string validation
        args = request.args
        print("args: " + json.dumps(args, sort_keys=True, indent=2))
        print(str(bool(args)))

        if not args:
            referrals = abort_if_referrals_doesnt_exist()
        else:
            referrals = referralManager.search(args)
        return referrals
            
    
    """ Creates a new Referral
        JSON Request Body Example: 
        {
            "patient": {
                "patientId": ...,
                ...
            },
            "reading": {
                "readingId": ...,
                ...
            }
            “referral”: {
                "date" : "2019-09-29T17:03:44.552-07:00[America\/Vancouver]", [REQUIRED]
                “comment” : “please help her”, [REQUIRED]
                "healthFacilityName": "St. Pauls Hospital", [REQUIRED]
                "actionTaken": "i tried to save the patient's life but need help now"
            }
        }

        Preconditions: 
            patient info and reading info included
            all values are the correct data type
        Description:
            creates Patient, Reading, and HealthFacility if not already created
        Returns: 
            newly created referral object
    """
    def post(self):
        req_data = self._get_request_body()
        return referralManager.create_referral_with_patient_and_reading(req_data), 201
