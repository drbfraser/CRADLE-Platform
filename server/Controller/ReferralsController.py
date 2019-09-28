from flask import request
from flask_restful import Resource, abort
from models import Referral, ReferralSchema
from config import db

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


# /referral/<int:id> [GET]
class ReferralInfo(Resource):
    def get(self, id):
        referral = abort_if_referral_doesnt_exist(id)

        referral_schema = ReferralSchema()
        data = referral_schema.dump(referral)
        return data

# /referral [GET, POST]
class ReferralApi(Resource):
    def get(self):
        referrals = abort_if_referrals_doesnt_exist()

        referral_schema = ReferralSchema(many=True)
        data = referral_schema.dump(referrals)
        return data

    # Create a new referral
    def post(self):
        print(request.get_json())
        referral_data = request.get_json()

        # Add a new referral to db
        schema = ReferralSchema()
        new_referral = schema.load(referral_data['referral'], session=db.session)

        db.session.add(new_referral)
        db.session.commit()

        # return the newly created referral
        data = schema.dump(new_referral)
        return data, 201