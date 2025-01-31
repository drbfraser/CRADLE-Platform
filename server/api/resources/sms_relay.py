import json

import requests
from flask import Response, abort, jsonify, make_response
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from humps import decamelize
from pydantic import ValidationError

from common import phone_number_utils, user_utils
from service import compressor, encryptor
from validation.sms_relay import (
    SmsRelayDecryptedBody,
    SmsRelayRequestBody,
    SmsRelayResponse,
)

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

invalid_json = "Invalid JSON Request Structure; {error}"

invalid_req_number = "Invalid Request Number; {error}"

error_req_range = "Must be between 0-999999"

invalid_method = "Invalid Method; Must be either GET, POST, HEAD, PUT, DELETE, or PATCH"

phone_number_not_exists = (
    "The phone number: ({phone_number}) does not belong to any users"
)


def _send_request_to_endpoint(
    method: str,
    endpoint: str,
    header: dict,
    body: str,
) -> requests.Response:
    return requests.request(
        method=method,
        url=api_url.format(endpoint=endpoint),
        headers=header,
        json=json.loads(body),
    )


def _create_flask_response(
    code: int, body: str, iv: str, user_sms_key: str
) -> Response:
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


_iv_size = 32


# /api/sms_relay
api_sms_relay = APIBlueprint(
    name="sms_relay",
    import_name=__name__,
    url_prefix="/sms_relay",
    abp_tags=[Tag(name="SMS Relay", description="")],
    abp_security=[{"jwt": []}],
)


# /api/sms_relay [POST]
@api_sms_relay.post("", responses={200: SmsRelayResponse})
def relay_sms_request(body: SmsRelayRequestBody):
    """Relay SMS Request"""
    phone_number = body.phone_number

    phone_number_exists = phone_number_utils.does_phone_number_belong_to_a_user(
        phone_number
    )
    if not phone_number_exists:
        return abort(
            400,
            description=phone_number_not_exists.format(
                phone_number=phone_number, type="JSON"
            ),
        )

    # Get user id for the user that phone_number belongs to
    user = user_utils.get_user_orm_from_phone_number(phone_number)
    if user is None:
        return abort(404, description=invalid_user.format(type="JSON"))

    encrypted_data = body.encrypted_data

    user_secret_key = user_utils.get_user_sms_secret_key_string(user.id)
    if user_secret_key is None:
        return abort(400, description="Could not retrieve user's SMS Secret Key.")

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
        return abort(401, description=error_message)

    try:
        decrypted_data = SmsRelayDecryptedBody(**json_dict_data)
    except ValidationError as e:
        return _create_flask_response(
            422,
            invalid_json.format(error=str(e)),
            encrypted_data[0:_iv_size],
            user_secret_key,
        )

    request_number = decrypted_data.request_number
    if (
        not isinstance(request_number, int)
        or request_number < 0
        or request_number > 999999
    ):
        return _create_flask_response(
            400,
            invalid_req_number.format(error=error_req_range),
            encrypted_data[0:_iv_size],
            user_secret_key,
        )

    headers = decrypted_data.headers
    if headers is None:
        headers = {}

    json_body = decrypted_data.body
    if json_body is None:
        json_body = "{}"

    # Sending request to endpoint
    method = str(decrypted_data.method)
    endpoint = decrypted_data.endpoint
    response = _send_request_to_endpoint(method, endpoint, headers, json_body)

    # Creating Response
    response_code = response.status_code
    response_body = json.dumps(response.json())
    return _create_flask_response(
        response_code,
        response_body,
        encrypted_data[0:_iv_size],
        user_secret_key,
    )
