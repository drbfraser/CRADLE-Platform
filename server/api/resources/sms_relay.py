import json

import requests
from flasgger import swag_from
from flask import Response, jsonify, make_response, request
from flask_restful import Resource, abort
from humps import decamelize

from common import api_utils, phone_number_utils, user_utils
from models import UserOrm
from service import compressor, encryptor
from validation.sms_relay import SmsRelayDecryptedBodyValidator, SmsRelayValidator
from validation.validation_exception import ValidationExceptionError

api_url = "http://localhost:5000/{endpoint}"

http_methods = {"GET", "POST", "HEAD", "PUT", "DELETE", "PATCH"}

corrupted_message = (
    "Server detected invalid message format ({type}); "
    "message may have been corrupted. "
    "Retry the action or contact your administrator."
)

invalid_message = (
    "Unable to verify message from ({phone_number}). "
    "Either the App and server don't agree on the security key "
    "or the message was corrupted. Retry the action or resync "
    "with the server using an internet connection (WiFi, 3G, …) "
)

invalid_user = "User does not exist"

null_phone_number = "No phone number was provided"

invalid_phone_number = (
    "Phone number {phone_number} has wrong format. The format for phone number should be +x-xxx-xxx-xxxx, "
    "+x-xxx-xxx-xxxxx, xxx-xxx-xxxx or xxx-xxx-xxxxx"
)

invalid_json = "Invalid JSON Request Structure; {error}"

invalid_req_number = "Invalid Request Number; {error}"

error_req_range = "Must be between 0-999999"

invalid_method = "Invalid Method; Must be either GET, POST, HEAD, PUT, DELETE, or PATCH"

phone_number_not_exists = "The phone number provided does not belong to any users"


def send_request_to_endpoint(
    method: str,
    endpoint: str,
    header: dict,
    body: str,
    user: UserOrm,
) -> requests.Response:
    access_token = request.authorization.token
    header["Authorization"] = f"Bearer {access_token}"
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

    compressed_data = compressor.compress_from_string(body)
    encrypted_data = encryptor.encrypt(compressed_data, iv, user_sms_key)

    response_body = {"code": code, "body": encrypted_data}

    response = make_response(jsonify(response_body))
    response.headers["Content-Type"] = "application/json"
    response.status_code = 200
    return response


iv_size = 32


def sms_relay_procedure():
    request_body = api_utils.get_request_body()

    try:
        sms_relay_pydantic_model = SmsRelayValidator.validate_request(request_body)
    except ValidationExceptionError:
        abort(400, message=corrupted_message.format(type="JSON"))
        return None

    sms_relay_model_dump = sms_relay_pydantic_model.model_dump()
    phone_number = sms_relay_model_dump["phone_number"]

    user_exists = phone_number_utils.does_phone_number_exist(phone_number)

    if not user_exists:
        abort(400, message=phone_number_not_exists.format(type="JSON"))
        return None

    # Get user id for the user that phone_number belongs to
    user = user_utils.get_user_orm_from_phone_number(phone_number)

    if user is None:
        abort(400, message=invalid_user.format(type="JSON"))
        return None

    encrypted_data = sms_relay_model_dump["encrypted_data"]

    user_secret_key = user_utils.get_user_sms_secret_key_string(user.id)
    if user_secret_key is None:
        abort(400, message="Could not retrieve user's sms secret key.")
        return None

    try:
        decrypted_message = encryptor.decrypt(encrypted_data, user_secret_key)
        decrypted_data = compressor.decompress(decrypted_message)
        string_data = decrypted_data.decode("utf-8")
        json_dict_data = json.loads(string_data)
        # Convert keys to snake case.
        json_dict_data = decamelize(json_dict_data)
    except Exception:
        error_message = str(invalid_message.format(phone_number=phone_number))
        print(error_message)
        abort(401, message=error_message)

    try:
        sms_relay_decrypted_pydantic_model = SmsRelayDecryptedBodyValidator.validate(
            json_dict_data,
        )
    except ValidationExceptionError as e:
        return create_flask_response(
            400,
            invalid_json.format(error=str(e)),
            encrypted_data[0:iv_size],
            user_secret_key,
        )

    sms_relay_decrypted_model_dump = sms_relay_decrypted_pydantic_model.model_dump()

    request_number = sms_relay_decrypted_model_dump["request_number"]
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

    method = sms_relay_decrypted_model_dump["method"]
    endpoint = sms_relay_decrypted_model_dump["endpoint"]

    header = sms_relay_decrypted_model_dump.get("header")
    if not header:
        header = {}

    json_body = sms_relay_decrypted_model_dump.get("body")
    if not json_body:
        json_body = "{}"

    # Sending request to endpoint
    response = send_request_to_endpoint(method, endpoint, header, json_body, user)

    # Creating Response
    response_code = response.status_code
    print(response_code)

    response_body = json.dumps(response.json())
    return create_flask_response(
        response_code,
        response_body,
        encrypted_data[0:iv_size],
        user_secret_key,
    )


# /api/sms_relay
class Root(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/sms-relay-post.yaml",
        methods=["POST"],
        endpoint="sms_relay",
    )
    def post():
        return sms_relay_procedure()
