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

api_url = "http://localhost:5000/{endpoint}"


http_methods = {"GET", "POST", "HEAD", "PUT", "DELETE", "OPTIONS", "PATCH"}

def jwt_token():
    payload = {"email": "admin123@admin.com", "password": "admin123"}
    response = requests.post("http://localhost:5000/api/user/auth", json=payload)
    resp_json = response.json()
    return resp_json["token"]


def send_request_to_endpoint(method: str, endpoint: str, header: dict, body: str, user: User) -> requests.Response:
    token = jwt_token()
    headers = {"Authorization": f"Bearer {token}"}
    return requests.request(
        method=method,
        url=api_url.format(endpoint=endpoint),
        headers=headers,
        json=json.loads(body)
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

    error = sms_relay.validate_request(json_request)

    if error:
        abort(400, message=corrupted_message.format(type="JSON"))

    phoneNumber = json_request["phoneNumber"]

    if not phoneNumber:
        abort(400, message=corrupted_message.format(type="JSON"))

    # Authorization Check
    user = crud.read(User, phoneNumber=phoneNumber)

    if not user:
        abort(401, message=invalid_message.format(phoneNumber=phoneNumber))

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
        abort(401, message=invalid_message.format(phoneNumber=phoneNumber))

    # Object Parsing
    string_data = data.decode("utf-8")
    json_dict = json.loads(string_data)

    endpoint = json_dict["endpoint"]
    json_body = json_dict["body"]

    method = json_dict["method"]

    if method not in http_methods:
        abort(401, message=invalid_message.format(phoneNumber=phoneNumber))
    
    # Sending request to endpoint
    response = send_request_to_endpoint(method, endpoint, {}, json_body, user)

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
