from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
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


# /api/sms_relay
class SMSRelay(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/sms-relay-get.yml",
        methods=["GET"],
        endpoint="sms_relay",
    )
    def get():
        return

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/sms-relay-put.yml",
        methods=["PUT"],
        endpoint="sms_relay",
    )
    def put():
        return
