from flask import request
from flask_restful import Resource, abort
from models import Referral, ReferralSchema
from config import db
import json

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
        abort(404, message="Referral {} already exists".format(referral_id))

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
        if 'referral' in raw_req_body:
            body = raw_req_body['referral']
        else:
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
        JSON Request Body Example: {
            "dateReferred" : "2019-09-25T19:00:16.683-07:00[America/Vancouver]",
            "comment" : "please help her",
            "userId" : null,
            "patientId": "34",
            "referralHealthFacilityId": 1,
            "readingId" : 1,
            "followUpId" : null
        }
        Preconditions: 
            userId belongs to a valid User, required
            patientId belongs to a valid Patient, required
            referralHealthFacilityId belongs to a valid HealthFacility, required
            readingId belongs to a valid Reading, required
            followUpId belongs to a valid FollowUp
        Returns: 
            newly created referral object
    """
    def post(self):
        referral_data = self._get_request_body()

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