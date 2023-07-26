import pytest
import data.crud as crud
from models import User

import api.resources.sms_relay as sms_relay
import systemTests.api.test_sms_relay as sms_relay_test

import service.compressor as compressor
import service.encryptor as encryptor
import base64
import json

sms_relay_endpoint = "/api/sms_relay"

'''
def test_sms_relay_invalid_json(api_post):
    json_body = {"phone": "1234567890"}
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 400
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.corrupted_message.format(type="JSON")


def test_sms_relay_none_phone_number(api_post):
    json_body = {"phoneNumber": None, "encryptedData": "a"}
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 400
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.corrupted_message.format(type="JSON")


def test_sms_relay_invalid_phone_number(api_post):
    phoneNumber = "555-555-5555"
    json_body = {"phoneNumber": phoneNumber, "encryptedData": "a"}
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_message.format(
        phoneNumber=phoneNumber
    )


def test_sms_relay_invalid_phone_number_format(api_post):
    # test fot the general cases
    phoneNumber = "This is wrong phone number"
    json_body = {"phoneNumber": phoneNumber, "encryptedData": "a"}
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_phone_number.format(
        phoneNumber=phoneNumber
    )
    # test for the phone number with extra symbol and alphabet
    phoneNumber = "+223-445d-0ggff"
    json_body = {"phoneNumber": phoneNumber, "encryptedData": "a"}
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_phone_number.format(
        phoneNumber=phoneNumber
    )
    # test for the phone number with other extreme cases
    phoneNumber = "sssss+1-555-555-5555vdfsger"
    json_body = {"phoneNumber": phoneNumber, "encryptedData": "a"}
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_phone_number.format(
        phoneNumber=phoneNumber
    )


def test_sms_relay_invalid_encryption_key(api_post):
    user = crud.read(User, id=1)
    phoneNumber = user.phoneNumber

    new_key = encryptor.generate_key("invalid@email.com")

    data = {"endpoint": None, "body": None}
    json_data = json.dumps(data)

    encrypted_data = encryptor.encrypt(bytes(json_data, "utf-8"), new_key)

    base64_data = base64.b64encode(encrypted_data)
    base64_string = base64_data.decode("utf-8")

    json_body = {"phoneNumber": phoneNumber, "encryptedData": base64_string}
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_message.format(
        phoneNumber=phoneNumber
    )


def test_sms_relay_corrupted_base64(api_post):
    user = crud.read(User, id=1)
    phoneNumber = user.phoneNumber

    data = {"endpoint": None, "body": None}
    json_data = json.dumps(data)

    base64_data = base64.b64encode(bytes(json_data, "utf-8"))
    base64_string = base64_data.decode("utf-8")

    json_body = {"phoneNumber": phoneNumber, "encryptedData": base64_string}
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_message.format(
        phoneNumber=phoneNumber
    )


def test_sms_relay_failed_decompression(api_post):
    user = crud.read(User, id=1)
    phoneNumber = user.phoneNumber

    data = {"endpoint": None, "body": None}
    json_data = json.dumps(data)

    encrypted_data = encryptor.encrypt(bytes(json_data, "utf-8"), user.secretKey)

    base64_data = base64.b64encode(encrypted_data)
    base64_string = base64_data.decode("utf-8")

    json_body = {"phoneNumber": phoneNumber, "encryptedData": base64_string}
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_message.format(
        phoneNumber=phoneNumber
    )


def test_sms_relay_invalid_encrypted_json(api_post):
    user = crud.read(User, id=1)
    phoneNumber = user.phoneNumber

    data = {"method": "PUT", "endpoint": "a"}

    compressed_data = compressor.compress_from_string(json.dumps(data))
    encrypted_data = encryptor.encrypt(compressed_data, user.secretKey)

    base64_data = base64.b64encode(encrypted_data)
    base64_string = base64_data.decode("utf-8")

    json_body = {"phoneNumber": phoneNumber, "encryptedData": base64_string}
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 200
    response_dict = sms_relay_test.get_sms_relay_response(response)
    assert response_dict["code"] == 400
    error = "The request body key {requestNumber} is required."
    assert response_dict["body"] == sms_relay.invalid_json.format(error=error)


def test_sms_relay_invalid_request_number(api_post):
    request_number = 1000000
    endpoint = "a"
    method = "PUT"

    json_body = sms_relay_test.make_sms_relay_json(request_number, endpoint, method)

    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 200
    response_dict = sms_relay_test.get_sms_relay_response(response)
    assert response_dict["code"] == 400
    assert response_dict["body"] == sms_relay.invalid_req_number.format(
        error=sms_relay.error_req_range
    )


def test_sms_relay_invalid_method(api_post):
    request_number = 100000
    endpoint = "a"
    method = "A"

    json_body = sms_relay_test.make_sms_relay_json(request_number, endpoint, method)

    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 200
    response_dict = sms_relay_test.get_sms_relay_response(response)
    assert response_dict["code"] == 400
    assert response_dict["body"] == sms_relay.invalid_method
'''