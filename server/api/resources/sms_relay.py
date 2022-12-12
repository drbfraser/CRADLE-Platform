from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from flask import redirect, request
from flask_restful import Resource, abort
from data import crud, marshal
from flasgger import swag_from
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

        error = sms_relay.validate_post_request(json_request)
        
        if error:
            abort(400, message=error)

        # Authorization Check
        current_user = get_jwt_identity()

        user = crud.read(User, id=current_user["userId"])

        if user.phoneNumber != json_request["phoneNumber"]:
            abort(401, message=f"Invalid Phone Number")

        encrypted_data = base64.b64decode(json_request['encryptedData'])

        test = "abc123"
        comp = compressor.compress_from_string(test)
        encrypted = encryptor.encrypt(comp, user.secretKey)

        # abort(400, message=base64.b64encode(encrypted).decode('utf-8'))

        # Decryption
        try:
            decrypted_data = encryptor.decrypt(encrypted_data, user.secretKey)
        except fernet.InvalidToken:
            abort(401, message=f"Invalid Key")
        except:
            abort(401, message=f"Invalid Data")

        # Decompression
        data = compressor.decompress(decrypted_data)
        # abort(400, message=data.decode('utf-8'))

        # Object Parsing
        string_data = data.decode('utf-8')
        json_data = json.dumps(string_data)
        
        endpoint = json_data["endpoint"]
        json_request = json_data["request"]
        
        # HTTP Redirect
        return redirect(
            endpoint,
            302,
            json_request,
        )
