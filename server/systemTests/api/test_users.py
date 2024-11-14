import random
import string

import phonenumbers
import pytest
import requests

from models import SmsSecretKeyOrm
from server.data import crud
from shared.user_utils import UserUtils


def generate_random_email(domain="example.com", length=10):
    username = "".join(random.choices(string.ascii_letters + string.digits, k=length))
    email = f"{username}@{domain}"
    return email


def generate_random_phone_number():
    phone_number = f"+1{random.randint(1000000000, 9999999999)}"
    return phone_number


def get_example_phone_number():
    phone_number_obj = phonenumbers.example_number("CA")
    print(phone_number_obj)
    phone_number = phonenumbers.format_number(
        phone_number_obj, phonenumbers.PhoneNumberFormat.E164
    )
    print(phone_number)
    return phone_number


# TEST COMMENT
@pytest.fixture(scope="module")
def jwt_token():
    payload = {"username": "admin@admin.com", "password": "Admin_123"}
    response = requests.post("http://localhost:5000/api/user/auth", json=payload)
    resp_json = response.json()
    return resp_json["access_token"]


def test_register_user(jwt_token):
    url_register_user = "http://localhost:5000/api/user/register"
    headers = {"Authorization": "Bearer " + jwt_token}
    random_email = generate_random_email()
    phone_number = get_example_phone_number()
    username = "test_register"
    payload = {
        "name": "Test Register User",
        "username": username,
        "email": random_email,
        "phone_number": phone_number,
        "phone_numbers": [phone_number],
        "health_facility_name": "H0000",
        "password": "Password_123",
        "role": "VHT",
        "supervises": [],
    }

    response = requests.post(url_register_user, json=payload, headers=headers)
    assert response.status_code == 200
    # Cleanup
    UserUtils.delete_user(username)


def test_edit_user(jwt_token):
    url_edit_user = "http://localhost:5000/api/user/3"
    headers = {"Authorization": "Bearer " + jwt_token}
    payload = {
        "health_facility_name": "H0000",
        "name": "TestVHT***",
        "role": "VHT",
        "email": "vht@email.com",
        "supervises": [],
        "phone_numbers": ["+1-666-666-6666", "+1-555-555-5555", "+1-777-777-7777"],
        "index": 2,
        "phone_number": "+1-604-715-2845",
    }

    response = requests.put(url_edit_user, json=payload, headers=headers)
    assert response.status_code == 200


def test_get_all_users(jwt_token):
    url_get_all_users = "http://localhost:5000/api/user/all"
    headers = {"Authorization": "Bearer " + jwt_token}

    response = requests.get(url_get_all_users, headers=headers)
    assert response.status_code == 200


def test_get_current_user(jwt_token):
    url_get_current_user = "http://localhost:5000/api/user/current"
    headers = {"Authorization": "Bearer " + jwt_token}
    response = requests.get(url_get_current_user, headers=headers)
    assert response.status_code == 200


def test_sms_secret_key_for_sms_relay(jwt_token, admin_user_id):
    url_sms_secret_key_for_user = (
        f"http://localhost:5000/api/user/{admin_user_id}/smskey"
    )
    headers = {"Authorization": "Bearer " + jwt_token}
    get_response = requests.get(url_sms_secret_key_for_user, headers=headers)
    resp_body = get_response.json()
    user = crud.read(SmsSecretKeyOrm, user_id=admin_user_id)
    print(resp_body)
    assert get_response.status_code == 200
    assert resp_body["message"] == "NORMAL"
    assert resp_body["key"] == user.secret_key
    assert user.secret_key is not None and user.secret_key == resp_body["key"]

    put_response = requests.put(url_sms_secret_key_for_user, headers=headers)
    put_resp_body = put_response.json()
    assert put_response.status_code == 200
    assert put_resp_body["message"] == "NORMAL"
    assert put_resp_body["key"] is not None and put_resp_body["key"] != resp_body["key"]


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
        "new_phone_number": new_phone_number,
        "current_phone_number": None,
        "old_phone_number": None,
    }
    response = requests.post(url_user_phone_update, json=payload, headers=headers)
    resp_body = response.json()

    assert response.status_code == 200
    assert resp_body["message"] == "User phone number added successfully"


# add new_phone_number again
def test_duplicate_phone_numbers_post(jwt_token, user_id, new_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"
    headers = {"Authorization": "Bearer " + jwt_token}

    payload = {
        "new_phone_number": new_phone_number,
        "current_phone_number": None,
        "old_phone_number": None,
    }
    response = requests.post(url_user_phone_update, json=payload, headers=headers)
    resp_body = response.json()

    assert response.status_code == 400
    assert resp_body["message"] == "Phone number already exists"


def test_user_phone_put(jwt_token, user_id, new_phone_number, updated_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"
    headers = {"Authorization": "Bearer " + jwt_token}

    payload = {
        "new_phone_number": updated_phone_number,
        "current_phone_number": new_phone_number,
        "old_phone_number": None,
    }
    response = requests.put(url_user_phone_update, json=payload, headers=headers)
    resp_body = response.json()

    assert response.status_code == 200
    assert resp_body["message"] == "User phone number updated successfully"

    # after testing, below changes the phone number back to what it was
    payload = {
        "new_phone_number": new_phone_number,
        "current_phone_number": updated_phone_number,
        "old_phone_number": None,
    }
    response = requests.put(url_user_phone_update, json=payload, headers=headers)


def test_user_phone_delete(jwt_token, user_id, old_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"
    headers = {"Authorization": "Bearer " + jwt_token}

    payload = {
        "old_phone_number": old_phone_number,
        "current_phone_number": None,
        "new_phone_number": None,
    }
    response = requests.delete(url_user_phone_update, json=payload, headers=headers)
    resp_body = response.json()

    assert response.status_code == 200
    assert resp_body["message"] == "User phone number deleted successfully"
