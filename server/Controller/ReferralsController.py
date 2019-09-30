from flask import request
from flask_restful import Resource, abort
from models import Referral, ReferralSchema
from config import db
import json

from Manager.ReadingManager import *
from Manager.PatientManager import *
from Manager.HealthFacilityManager import *

from models import User, Patient, HealthFacility, Reading, FollowUp

from Validation.ReferralValidator import ReferralValidator

validator = ReferralValidator()

def abort_if_referral_doesnt_exist(referral_id):
    referral = Referral.query.filter_by(id=referral_id).one_or_none()

    if referral is None:
        abort(404, message="Referral {} doesn't exist".format(referral_id))
    else:
        return referral

def abort_if_referrals_doesnt_exist():
    referrals = Referral.query.all()

    if referrals is None:
        abort(404, message="No referrals")
    else:
        return referrals

def abort_if_referral_exists(referral_id):
    referral = Referral.query.filter_by(id=referral_id).one_or_none()

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

        referral_schema = ReferralSchema()
        data = referral_schema.dump(referral)
        return data

# /referral [GET, POST]
class ReferralApi(Resource):
    @staticmethod
    def _get_request_body():
        raw_req_body = request.get_json(force=True)
        # if 'referral' in raw_req_body:
        #     body = raw_req_body['referral']
        # else:
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
        # NEEDS TESTING AND 
        args = request.args
        print("args: " + json.dumps(args, sort_keys=True, indent=2))

        print(str(bool(args)))

        referral_schema = ReferralSchema(many=True)

        if not args:
            referrals = abort_if_referrals_doesnt_exist()
        else:
            referrals = Referral.query.filter_by(**args)
        
        data = referral_schema.dump(referrals)
        return data
            

    
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
        
        # if the patient is already created, dont create, 
        try:
            validator.exists(Patient, "patientId", req_data['patient']['patientId'])
        except Exception as e:
            print("patient does not exist yet, creating")
            # do validation here
            created_patient = create_patient(req_data['patient'])  
            print("created_patient: ")
            pprint(created_patient)

        # if the reading already created, dont create, else use the patientId
        # and create new reading
        try:
            validator.exists(Reading, "readingId", req_data['reading']['readingId'])
        except Exception as e:
            print("reading does not exist yet, creating")
            req_data['reading']['patientId'] = req_data['patient']['patientId']
            created_reading = create_reading(req_data['reading'])
            print("created_reading: ")
            pprint(created_reading)

        # if the health facility is created, dont create, else use the 
        # healthFacilityName to create a new health facility 
        try:
            validator.exists(HealthFacility, "healthFacilityName", req_data['healthFacilityName'])
        except Exception as e:
            print("healthFacility doesnt exist, creating")
            created_hf = create_health_facility(
                {'healthFacilityName': req_data['healthFacilityName']}
            )
            print("created health facility: ")
            pprint(created_hf)

        referral_data = build_ref_dict(req_data)

        print("referral_data: ")
        pprint(referral_data)

        # validate new referral 
        try:
            validator.enforce_required(referral_data)
            validator.validate(referral_data)
        except Exception as e:
            print(e)
            return {
                "code": 400,
                "error": str(e)
            }, 400

        # Add a new referral to db
        schema = ReferralSchema()
        new_referral = schema.load(referral_data, session=db.session)

        db.session.add(new_referral)
        db.session.commit()

        # return the newly created referral
        data = schema.dump(new_referral)
        return data, 201

def build_ref_dict(ref_json):
    ref_dict = {}
    ref_dict['patientId'] = ref_json['patient']['patientId']
    ref_dict['readingId'] = ref_json['reading']['readingId']
    ref_dict['dateReferred'] = ref_json['date']
    ref_dict['referralHealthFacilityName'] = ref_json['healthFacilityName']
    ref_dict['comment'] = ref_json['comment']
    return ref_dict

def pprint(to_print):
    print(json.dumps(to_print, sort_keys=True, indent=2))