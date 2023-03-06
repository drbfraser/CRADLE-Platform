import pytest

import data.crud as crud
from models import User

import api.resources.sms_relay as sms_relay
import service.compressor as compressor
import service.encryptor as encryptor
import base64
import json

sms_relay_endpoint = "/api/sms_relay"


def test_sms_relay_invalid_json(api_post):
    json_request = {"phone": "1234567890"}
    response = api_post(endpoint=sms_relay_endpoint, json=json_request)

    assert response.status_code == 400
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.corrupted_message.format(type="JSON")


def test_sms_relay_none_phone_number(api_post):
    json_request = {"phoneNumber": None, "encryptedData": None}
    response = api_post(endpoint=sms_relay_endpoint, json=json_request)

    assert response.status_code == 400
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.corrupted_message.format(type="JSON")


def test_sms_relay_invalid_phone_number(api_post):
    phoneNumber = "312"
    json_request = {"phoneNumber": phoneNumber, "encryptedData": None}
    response = api_post(endpoint=sms_relay_endpoint, json=json_request)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_message.format(
        phoneNumber=phoneNumber
    )


def test_sms_relay_invalid_encryption_key(api_post):
    user = crud.read(User, id=1)
    phoneNumber = user.phoneNumber

    user_key = user.secretKey
    new_key = encryptor.generate_key()

    # The very low chance that the 2 generated keys are the same
    while new_key == user_key:
        new_key = encryptor.generate_key()

    data = {"endpoint": None, "request": None}
    json_data = json.dumps(data)

    encrypted_data = encryptor.encrypt(bytes(json_data, "utf-8"), new_key)

    base64_data = base64.b64encode(encrypted_data)
    base64_string = base64_data.decode("utf-8")

    json_request = {"phoneNumber": phoneNumber, "encryptedData": base64_string}
    response = api_post(endpoint=sms_relay_endpoint, json=json_request)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_message.format(
        phoneNumber=phoneNumber
    )
