import json
from flask import request
from flask_restful import Resource, abort
from config import db
from utils import pprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from

# Project modules
from Manager.ReferralManager import ReferralManager
from Validation.ReferralValidator import ReferralValidator
from Controller.Helpers import _get_request_body

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
    referral = referralManager.read("id", referral_id)
    if referral:
        abort(400, message="Referral {} already exists".format(referral_id))


""" Returns a single referral matching the inputted id
    urlParams:
        id: id/primary key of referral
    returns:
        single referral matching submitted id
"""
# /referral/<int:id> [GET, PUT]
class ReferralInfo(Resource):
    @swag_from("../specifications/referral-get.yml", methods=["GET"])
    def get(self, id):
        referral = abort_if_referral_doesnt_exist(id)
        return referral

    def put(self, id=None):
        if not id:
            abort(400, message="id is required")

        new_referral_fields = ReferralApi._get_request_body()
        update_res = referralManager.update("id", id, new_referral_fields)

        if not update_res:
            abort(400, message=f'No referral exists with id "{id}"')
        else:
            return update_res


# /referral [GET, POST]
class ReferralApi(Resource):

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

    @jwt_required
    @swag_from("../specifications/referrals-get.yml", methods=["GET"])
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

    @jwt_required
    def post(self):
        req_data = _get_request_body()

        current_user = get_jwt_identity()
        user_id = current_user["userId"]
        return (
            referralManager.create_referral_with_patient_and_reading(req_data, user_id),
            201,
        )
