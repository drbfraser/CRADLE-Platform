import pytest
import requests
import json

from data import crud
from models import SmsSecretKey


@pytest.fixture(scope="module")
def jwt_token():
    payload = {"email": "admin123@admin.com", "password": "admin123"}
    response = requests.post("http://localhost:5000/api/user/auth", json=payload)
    resp_json = response.json()
    print("getting jwt token...")
    return resp_json["token"]


def test_get_all_users(jwt_token):
    url_get_all_users = "http://localhost:5000/api/user/all"
    headers = {"Authorization": "Bearer " + jwt_token}

    response = requests.get(url_get_all_users, headers=headers)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200


def test_get_current_user(jwt_token):
    url_get_current_user = "http://localhost:5000/api/user/current"
    headers = {"Authorization": "Bearer " + jwt_token}
    response = requests.get(url_get_current_user, headers=headers)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200


def test_sms_secret_key_for_sms_relay(jwt_token, admin_user_id):
    url_sms_secret_key_for_user = (
        f"http://localhost:5000/api/user/{admin_user_id}/smskey"
    )
    headers = {"Authorization": "Bearer " + jwt_token}
    get_response = requests.get(url_sms_secret_key_for_user, headers=headers)
    resp_body = get_response.json()
    user = crud.read(SmsSecretKey, userId=admin_user_id)

    print(json.dumps(resp_body, indent=4))
    assert get_response.status_code == 200
    assert resp_body["message"] == "A sms key has been found"
    assert resp_body["sms_key"] is not None and resp_body["sms_key"] == user.secret_Key
    assert user.secret_Key is not None and user.secret_Key == resp_body["sms_key"]

    put_response = requests.put(url_sms_secret_key_for_user, headers=headers)
    put_resp_body = put_response.json()
    assert put_response.status_code == 200
    assert (
        put_resp_body["message"]
        == "New key has been updated, detail is showing below: "
    )
    assert (
        put_resp_body["sms_key"] is not None
        and put_resp_body["sms_key"] != resp_body["sms_key"]
    )


@pytest.fixture
def admin_user_id():
    return 1


@pytest.fixture
def user_id():
    return 3


@pytest.fixture
def new_phone_number():
    return "+12223332020"


@pytest.fixture
def old_phone_number():
    return "+12223332020"


@pytest.fixture
def updated_phone_number():
    return "+12223333030"


def test_user_phone_post(jwt_token, user_id, new_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"
    headers = {"Authorization": "Bearer " + jwt_token}

    payload = {
        "newPhoneNumber": new_phone_number,
        "currentPhoneNumber": None,
        "oldPhoneNumber": None,
    }
    response = requests.post(url_user_phone_update, json=payload, headers=headers)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200
    assert resp_body["message"] == "User phone number added successfully"


# add new_phone_number again
def test_duplicate_phone_numbers_post(jwt_token, user_id, new_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"
    headers = {"Authorization": "Bearer " + jwt_token}

    payload = {
        "newPhoneNumber": new_phone_number,
        "currentPhoneNumber": None,
        "oldPhoneNumber": None,
    }
    response = requests.post(url_user_phone_update, json=payload, headers=headers)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 400
    assert resp_body["message"] == "Phone number already exists"


def test_user_phone_put(jwt_token, user_id, new_phone_number, updated_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"
    headers = {"Authorization": "Bearer " + jwt_token}

    payload = {
        "newPhoneNumber": updated_phone_number,
        "currentPhoneNumber": new_phone_number,
        "oldPhoneNumber": None,
    }
    response = requests.put(url_user_phone_update, json=payload, headers=headers)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200
    assert resp_body["message"] == "User phone number updated successfully"

    # after testing, below changes the phone number back to what it was
    payload = {
        "newPhoneNumber": new_phone_number,
        "currentPhoneNumber": updated_phone_number,
        "oldPhoneNumber": None,
    }
    response = requests.put(url_user_phone_update, json=payload, headers=headers)


def test_user_phone_delete(jwt_token, user_id, old_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"
    headers = {"Authorization": "Bearer " + jwt_token}

    payload = {
        "oldPhoneNumber": old_phone_number,
        "currentPhoneNumber": None,
        "newPhoneNumber": None,
    }
    response = requests.delete(url_user_phone_update, json=payload, headers=headers)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200
    assert resp_body["message"] == "User phone number deleted successfully"
