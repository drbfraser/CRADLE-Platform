import re

from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import redirect, request, url_for, make_response, Response
from flask_restful import Resource, abort
import requests

from data import crud, marshal
from flasgger import swag_from
from models import User
import service.compressor as compressor
import service.encryptor as encryptor
import cryptography.fernet as fernet
from validation import sms_relay
import base64
import json
from api.resources.users import get_user_data_for_token, get_access_token
from api.util import phoneNumber_regex_check as regex_check

api_url = "http://localhost:5000/{endpoint}"


http_methods = {"GET", "POST", "HEAD", "PUT", "DELETE", "PATCH"}


corrupted_message = (
    "Server detected invalid message format ({type}); "
    "message may have been corrupted. "
    "Retry the action or contact your administrator."
)

invalid_message = (
    "Unable to verify message from ({phoneNumber}). "
    "Either the phone number is not associated with a user, "
    "or the App and server don't agree on the security key, "
    "or the message was corrupted. Retry the action or resync "
    "with the server using an internet connection (WiFi, 3G, …) "
)

invalid_phone_number = (
    "Phone number {phoneNumber} has wrong format. The format for phone number should be +x-xxx-xxx-xxxx, "
    "+x-xxx-xxx-xxxxx, xxx-xxx-xxxx or xxx-xxx-xxxxx"
)

invalid_json = "Invalid JSON Request Structure; {error}"


invalid_req_number = "Invalid Request Number; {error}"


error_req_range = "Must be between 0-999999"


invalid_method = "Invalid Method; Must be either GET, POST, HEAD, PUT, DELETE, or PATCH"


def send_request_to_endpoint(
    method: str, endpoint: str, header: dict, body: str, user: User
) -> requests.Response:
    data = get_user_data_for_token(user)
    token = get_access_token(data)
    header["Authorization"] = f"Bearer {token}"
    return requests.request(
        method=method,
        url=api_url.format(endpoint=endpoint),
        headers=header,
        json=json.loads(body),
    )


def create_flask_response(code: int, body: str, user: User) -> Response:
    response_dict = {"code": code, "body": body}

    response_json = json.dumps(response_dict)

    compressed_data = compressor.compress_from_string(response_json)
    encrypted_data = encryptor.encrypt(compressed_data, user.secretKey)

    base64_data = base64.b64encode(encrypted_data)
    base64_string = base64_data.decode("utf-8")

    flask_response = make_response()
    flask_response.set_data(base64_string)
    flask_response.status_code = 200

    return flask_response


def sms_relay_procedure():
    json_request = request.get_json(force=True)

    # Error Checking
    error = sms_relay.validate_request(json_request)

    if error:
        abort(400, message=corrupted_message.format(type="JSON"))

    phoneNumber = json_request["destPhoneNumber"]

    if not phoneNumber:
        abort(400, message=invalid_phone_number.format(phoneNumber=phoneNumber))

    if not regex_check(phoneNumber):
        abort(400, message=invalid_phone_number.format(phoneNumber=phoneNumber))

    user = crud.read(User, phoneNumber=phoneNumber)

    if not user:
        abort(400, message=invalid_message.format(phoneNumber=phoneNumber))

    encrypted_data = base64.b64decode(json_request["encryptedData"])

    # Decryption
    try:
        decrypted_data = encryptor.decrypt(encrypted_data, user.secretKey)

    except:
        abort(401, message=invalid_message.format(phoneNumber=phoneNumber))

    # Decompression
    try:
        data = compressor.decompress(decrypted_data)

    except:
        abort(400, message=invalid_message.format(phoneNumber=phoneNumber))

    # Object Parsing
    string_data = data.decode("utf-8")
    json_dict = json.loads(string_data)

    error = sms_relay.validate_encrypted_body(json_dict)
    if error:
        return create_flask_response(400, invalid_json.format(error=error), user)

    request_number = json_dict["requestNumber"]
    if (
        not isinstance(request_number, int)
        or request_number < 0
        or request_number > 999999
    ):
        return create_flask_response(
            400, invalid_req_number.format(error=error_req_range), user
        )

    method = json_dict["method"]
    if method not in http_methods:
        return create_flask_response(400, invalid_method, user)

    endpoint = json_dict["endpoint"]

    header = json_dict.get("header")
    if not header:
        header = {}

    json_body = json_dict.get("body")
    if not json_body:
        json_body = "{}"

    # Sending request to endpoint
    response = send_request_to_endpoint(method, endpoint, header, json_body, user)

    # Creating Response
    response_code = response.status_code
    response_body = json.dumps(response.json())
    return create_flask_response(response_code, response_body, user)


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
