from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import redirect, request, url_for
from flask_restful import Resource, abort
from data import crud, marshal
from flasgger import swag_from
from models import User
import service.compressor as compressor
import service.encryptor as encryptor
import cryptography.fernet as fernet
from validation import sms_relay
import base64
import json


def get_json(force: bool):
    json_request = request.get_json(force=force)

    if json_request.get("encryptedData", None):
        return json.loads(request.args.get("sms_data"))
    else:
        return json_request


def sms_relay_procedure():
    json_request = request.get_json(force=True)

    error = sms_relay.validate_post_request(json_request)

    if error:
        abort(400, message=error)


    phoneNumber = json_request["phoneNumber"]

    if not phoneNumber:
        abort(401, message=f"Invalid JSON")

    # Authorization Check
    user = crud.read(User, phoneNumber=phoneNumber)

    if not user:
        abort(401, message=f"Invalid Phone Number")

    encrypted_data = base64.b64decode(json_request["encryptedData"])

    # Decryption
    try:
        decrypted_data = encryptor.decrypt(encrypted_data, user.secretKey)
    except fernet.InvalidToken:
        abort(401, message=f"Invalid Key")
    except:
        abort(401, message=f"Invalid Data")

    # Decompression
    data = compressor.decompress(decrypted_data)

    # Object Parsing
    string_data = data.decode("utf-8")
    json_dict = json.loads(string_data)

    endpoint = json_dict["endpoint"]
    json_request = json_dict["request"]

    if "arguments" in json_dict:
        arguments_json = json_dict["arguments"]
        request_dict = json.loads(arguments_json)
    else:
        request_dict = {}

    request_dict["sms_data"] = json_request

    # HTTP Redirect
    return redirect(url_for(endpoint, **request_dict), 307)


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
        return sms_relay_procedure()

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/sms-relay-put.yaml", methods=["PUT"], endpoint="sms_relay"
    )
    def put():
        return sms_relay_procedure()
