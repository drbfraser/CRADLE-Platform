import base64
import json

from flask import Response

import systemTests.api.test_sms_relay as sms_relay_test
from api.resources import sms_relay
from data import crud
from models import SmsSecretKeyOrm, UserOrm, UserPhoneNumberOrm
from service import compressor, encryptor

sms_relay_endpoint = "/api/sms_relay"


def test_sms_relay_invalid_json(api_post):
    request_body = {"phone": "1234567890"}
    response = api_post(endpoint=sms_relay_endpoint, json=request_body)

    assert response.status_code == 400
    response_body = response.json()
    print(response_body)
    assert response_body["message"] == sms_relay.corrupted_message.format(type="JSON")


def test_sms_relay_none_phone_number(api_post):
    json_body = {"phone_number": None, "encrypted_data": "a"}
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 400
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.corrupted_message.format(type="JSON")


def test_sms_relay_invalid_phone_number(api_post):
    phone_number = "+11234567890"
    json_body = {"phone_number": phone_number, "encrypted_data": "a"}
    response: Response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 401
    response_body = response.json()
    print(response_body)
    assert response_body["message"] == sms_relay.invalid_message.format(
        phone_number=phone_number,
    )


def test_sms_relay_invalid_phone_number_format(api_post):
    # test fot the general cases
    phone_number = "This is wrong phone number"
    request_body = {"phone_number": phone_number, "encrypted_data": "a"}
    response = api_post(endpoint=sms_relay_endpoint, json=request_body)
    assert response.status_code == 400
    response_body = response.json()
    print(response_body)
    assert response_body["message"] == sms_relay.corrupted_message.format(type="JSON")

    # test for the phone number with extra symbol and alphabet
    phone_number = "+223-445d-0ggff"
    request_body = {"phone_number": phone_number, "encrypted_data": "a"}
    response = api_post(endpoint=sms_relay_endpoint, json=request_body)

    assert response.status_code == 400
    response_body = response.json()
    assert response_body["message"] == sms_relay.corrupted_message.format(type="JSON")

    # test for the phone number with other extreme cases
    phone_number = "sssss+1-555-555-5555vdfsger"
    request_body = {"phone_number": phone_number, "encrypted_data": "a"}
    response = api_post(endpoint=sms_relay_endpoint, json=request_body)

    assert response.status_code == 400
    response_body = response.json()
    assert response_body["message"] == sms_relay.corrupted_message.format(type="JSON")


def test_sms_relay_invalid_encryption_key(api_post):
    user = crud.read(UserOrm, id=1)
    phone_number = crud.read_all(UserPhoneNumberOrm, user_id=user.id).pop()

    new_key = "1a9b4f7c3e8d2f5a6b4f7c3e8d2f5a1a"

    iv = "00112233445566778899aabbccddeeff"

    data = {"endpoint": None, "body": None}
    json_data = json.dumps(data)

    encrypted_data = encryptor.encrypt(bytes(json_data, "utf-8"), iv, new_key)

    json_body = {
        "phone_number": phone_number.phone_number,
        "encrypted_data": encrypted_data,
    }
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_message.format(
        phone_number=phone_number.phone_number,
    )


def test_sms_relay_corrupted_base64(api_post):
    user = crud.read(UserOrm, id=1)
    phone_number = crud.read_all(UserPhoneNumberOrm, user_id=user.id).pop()

    data = {"endpoint": None, "body": None}
    json_data = json.dumps(data)

    base64_data = base64.b64encode(bytes(json_data, "utf-8"))
    base64_string = base64_data.decode("utf-8")

    json_body = {
        "phone_number": phone_number.phone_number,
        "encrypted_data": base64_string,
    }
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_message.format(
        phone_number=phone_number.phone_number,
    )


def test_sms_relay_failed_decompression(api_post):
    user = crud.read(UserOrm, id=1)
    phone_number = crud.read_all(UserPhoneNumberOrm, user_id=user.id).pop()
    secret_key = crud.read(SmsSecretKeyOrm, user_id=1)
    iv = "00112233445566778899aabbccddeeff"

    data = {"endpoint": None, "body": None}
    json_data = json.dumps(data)

    encrypted_data = encryptor.encrypt(
        bytes(json_data, "utf-8"),
        iv,
        secret_key.secret_key,
    )

    json_body = {
        "phone_number": phone_number.phone_number,
        "encrypted_data": encrypted_data,
    }
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 401
    actual_json = json.loads(response.text)
    assert actual_json["message"] == sms_relay.invalid_message.format(
        phone_number=phone_number.phone_number,
    )


def test_sms_relay_invalid_encrypted_json(api_post):
    user = crud.read(UserOrm, id=1)
    phone_number = crud.read_all(UserPhoneNumberOrm, user_id=user.id).pop()
    secret_key = crud.read(SmsSecretKeyOrm, user_id=1)
    iv = "00112233445566778899aabbccddeeff"

    data = {"method": "PUT", "endpoint": "a"}

    compressed_data = compressor.compress_from_string(json.dumps(data))
    encrypted_data = encryptor.encrypt(compressed_data, iv, secret_key.secret_key)

    json_body = {
        "phone_number": phone_number.phone_number,
        "encrypted_data": encrypted_data,
    }
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 200
    response_dict = sms_relay_test.get_sms_relay_response(response)
    assert response_dict["code"] == 400
    error = "The request body key {request_number} is required."
    assert response_dict["body"] == sms_relay.invalid_json.format(error=error)


def test_sms_relay_invalid_request_number(api_post):
    request_number = 1000000
    endpoint = "a"
    method = "PUT"

    json_body = sms_relay_test.make_sms_relay_json(request_number, method, endpoint)

    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 200
    response_dict = sms_relay_test.get_sms_relay_response(response)
    assert response_dict["code"] == 400
    assert response_dict["body"] == sms_relay.invalid_req_number.format(
        error=sms_relay.error_req_range,
    )


def test_sms_relay_invalid_method(api_post):
    request_number = 100000
    endpoint = "a"
    method = "A"

    json_body = sms_relay_test.make_sms_relay_json(request_number, method, endpoint)

    response = api_post(endpoint=sms_relay_endpoint, json=json_body)

    assert response.status_code == 200
    response_dict = sms_relay_test.get_sms_relay_response(response)
    assert response_dict["code"] == 400
    assert response_dict["body"] == sms_relay.invalid_json.format(
        error=sms_relay.invalid_method
    )
