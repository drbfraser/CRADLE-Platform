import re

from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import redirect, request, url_for, make_response, Response, jsonify
from flask_restful import Resource, abort
import requests

from data import crud, marshal
from flasgger import swag_from
from models import User
import service.compressor as compressor
import service.encryptor as encryptor
from validation import sms_relay
import base64
import json
from api.resources.users import get_user_data_for_token, get_access_token
from api.util import phoneNumber_regex_check as regex_check
from api.util import (
    get_user_secret_key_string,
    phoneNumber_exists,
    get_user_from_phone_number,
)

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

invalid_user = "User does not exist"

null_phone_number = "No phone number was provided"

invalid_phone_number = (
    "Phone number {phoneNumber} has wrong format. The format for phone number should be +x-xxx-xxx-xxxx, "
    "+x-xxx-xxx-xxxxx, xxx-xxx-xxxx or xxx-xxx-xxxxx"
)

invalid_json = "Invalid JSON Request Structure; {error}"

invalid_req_number = "Invalid Request Number; {error}"

error_req_range = "Must be between 0-999999"

invalid_method = "Invalid Method; Must be either GET, POST, HEAD, PUT, DELETE, or PATCH"

phone_number_not_exists = "The phone number provided does not belong any users"


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


def create_flask_response(code: int, body: str, iv: str, user_sms_key: str) -> Response:
    # Create a response object with the JSON data and set the content type
    # This response structure is defined in the SMS-Relay App -> model.HTTPSResponse
    # Do not change without updating Retrofit configuration
    # Currently the body is not processed by the Relay app (only its existence is checked)
    # Sending a generic success or failure string is an option

    print("\n\n\n\n\n\n", body< "\n\n\n\n\n\n")

    compressed_data = compressor.compress_from_string(body)
    encrypted_data = encryptor.encrypt(compressed_data, iv, user_sms_key)

    response_body = {"code": code, "body": encrypted_data}

    response = make_response(jsonify(response_body))
    response.headers["Content-Type"] = "application/json"
    response.status_code = 200
    return response


iv_size = 32


def sms_relay_procedure():
    abort(400, message=corrupted_message.format(type="JSON"))
    json_request = request.get_json(force=True)

    # Error Checking
    error = sms_relay.validate_request(json_request)

    if error:
        abort(400, message=corrupted_message.format(type="JSON"))

    phone_number = json_request["phoneNumber"]

    if not phone_number:
        abort(400, message=null_phone_number)

    if not regex_check(phone_number):
        abort(400, message=invalid_phone_number.format(phoneNumber=phone_number))

    user_exists = phoneNumber_exists(phone_number)

    if not user_exists:
        abort(400, message=phone_number_not_exists.format(type="JSON"))

    # get user id for the user that phoneNumber belongs to
    user = get_user_from_phone_number(phone_number)

    if not user:
        abort(400, message=invalid_user.format(type="JSON"))

    encrypted_data = json_request["encryptedData"]

    try:
        user_secret_key = get_user_secret_key_string(user.id)

        decrypted_message = encryptor.decrypt(encrypted_data, user_secret_key)

        decrypted_data = compressor.decompress(decrypted_message)

        string_data = decrypted_data.decode("utf-8")

        json_dict_data = json.loads(string_data)

    except:
        abort(401, message=invalid_message.format(phoneNumber=phone_number))

    error = sms_relay.validate_decrypted_body(json_dict_data)
    if error:
        return create_flask_response(
            400,
            invalid_json.format(error=error),
            encrypted_data[0:iv_size],
            user_secret_key,
        )

    request_number = json_dict_data["requestNumber"]
    request_number = int(request_number)
    if (
        not isinstance(request_number, int)
        or request_number < 0
        or request_number > 999999
    ):
        return create_flask_response(
            400,
            invalid_req_number.format(error=error_req_range),
            encrypted_data[0:iv_size],
            user_secret_key,
        )

    method = json_dict_data["method"]
    if method not in http_methods:
        return create_flask_response(
            400, invalid_method, encrypted_data[0:iv_size], user_secret_key
        )

    endpoint = json_dict_data["endpoint"]

    header = json_dict_data.get("header")
    if not header:
        header = {}

    json_body = json_dict_data.get("body")
    if not json_body:
        json_body = "{}"

    # Sending request to endpoint
    response = send_request_to_endpoint(method, endpoint, header, json_body, user)

    # Creating Response
    response_code = response.status_code
    response_body = json.dumps(response.json())
    return create_flask_response(
        response_code, response_body, encrypted_data[0:iv_size], user_secret_key
    )


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
