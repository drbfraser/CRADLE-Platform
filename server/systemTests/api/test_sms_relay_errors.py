import pytest

import data.crud as crud

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
    json_request = {"phoneNumber": None}
    response = api_post(endpoint=sms_relay_endpoint, json=json_request)

    assert response.status_code == 400
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.corrupted_message.format(type="JSON")
