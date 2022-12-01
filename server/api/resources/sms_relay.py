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

# /api/sms_relay
class Root(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/sms-relay-get.yaml",
        methods=["GET"],
        endpoint="sms_relay",
    )
    def get():
        return

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/sms-relay-put.yaml",
        methods=["PUT"],
        endpoint="sms_relay",
    )
    def put():
        data = request.files
        phone_number = request.args["phoneNumber"]
        user = crud.read(User, phoneNumber=phone_number)

        if (user == None):
            abort(401, message=f"Invalid Phone Number")

        try:
            encryptor.decrypt(data, user.secretKey)
        except fernet.InvalidToken:
            abort(401, message=f"Invalid Key")
        except:
            abort(401, message=f"Invalid data")

        return {"message": "Data received"}, 200
