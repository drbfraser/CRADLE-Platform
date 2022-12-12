from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from flask import redirect, request
from flask_restful import Resource, abort
from data import crud, marshal
import service.FilterHelper as filter
from models import (
    Patient,
    PatientSchema,
    User,
    Form,
    Reading,
    Referral,
    ReadingSchema,
    ReferralSchema,
)
from flasgger import swag_from
import api.util as util
import service.view as view
import service.serialize as serialize
import service.compressor as compressor
import service.encryptor as encryptor
import cryptography.fernet as fernet
from validation import sms_relay
import base64
import json

# /api/sms_relay
class Root(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/sms-relay-post.yaml",
        methods=["POST"],
        endpoint="sms_relay",
    )
    def post():
        json_request = request.get_json(force=True)

        error = sms_relay.validate_post_request(json)
        if error:
            abort(400, message=error)
        
        user = get_jwt_identity()
        # user = crud.read(User, phoneNumber=request_body['phoneNumber'])

        if (user.phoneNumber is not json_request['phoneNumber']):
            abort(401, message=f"Invalid Phone Number")

        data = base64.b64decode(json_request['data'])
        
        try:
            encryptor.decrypt(data, user.secretKey)
        except fernet.InvalidToken:
            abort(401, message=f"Invalid Key")
        except:
            abort(401, message=f"Invalid data")

        

        return redirect(
            endpoint,
            302,
            json_data
        )
