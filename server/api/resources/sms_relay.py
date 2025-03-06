import json

import requests
from flask import Response, abort, make_response
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


def _create_success_response(
    code: int, body: str, iv: str, user_sms_key: str
) -> Response:
    """
    Creates and returns a response object with a successful 200 status code,
    the JSON data and content type for the outer SMS relay request.
    Compresses and encrypts the inner destination API response and includes it in the outer response body.

    :param code: Response status code received from the inner API response.
    :param body: Response body received from the inner API response.
    :param iv: Initialization vector used for the AES data encryption.
    :param user_sms_key: User-specific secret key used to encrypt the data.

    :return: Returns a 200 status code response object with the inner API response stored as encrypted data in the response body.
    """
    data = json.dumps({"code": code, "body": body})
    compressed_data = compressor.compress_from_string(data)
    encrypted_data = encryptor.encrypt(compressed_data, iv, user_sms_key)

    response = make_response(encrypted_data)
    response.headers["Content-Type"] = "text/plain"
    response.status_code = 200
    return response


def _create_error_response(
    error_code: int, error_body: str, iv: str, user_sms_key: str
) -> Response:
    """
    Creates and returns a response object with an error status code for the outer API request.
    Compresses and encrypts the error message & error code and includes it in the response body.

    :param error_code: Error status code to send in response.
    :param error_body: Error message body to send in response.
    :param iv: Initialization vector used for the AES data encryption.
    :param user_sms_key: User-specific secret key used to encrypt the data.

    :return: Returns a response object with the error status code and stores the encrypted error message data in the response body.
    """
    data = json.dumps({"code": error_code, "body": error_body})
    compressed_data = compressor.compress_from_string(data)
    encrypted_data = encryptor.encrypt(compressed_data, iv, user_sms_key)

    response = make_response(encrypted_data)
    response.headers["Content-Type"] = "text/plain"
    response.status_code = error_code
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
        return abort(422, description=invalid_json.format(error=str(e)))

    # Gets expected user request number
    expected_request_number = user_utils.get_expected_sms_relay_request_number(user.id)
    if expected_request_number is None:
        print("No expected request number found for user")
        return abort(500, description="Internal Server Error")

    # Checks if request number is valid (must be exactly one greater than the previous valid request number)
    request_number = decrypted_data.request_number
    if request_number != expected_request_number:
        request_number_error_body = {
            "message": "Request number provided does not match the expected value.",
            "expected_request_number": expected_request_number,
        }

        return _create_error_response(
            425,
            str(request_number_error_body),
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

    # Update last received request number from user
    user_utils.increment_sms_relay_expected_request_number(user.id)

    # Creating Response
    response_code = response.status_code
    response_body = json.dumps(response.json())
    return _create_success_response(
        response_code,
        response_body,
        encrypted_data[0:_iv_size],
        user_secret_key,
    )
