import random
import string
from typing import Any, cast

import phonenumbers
import pytest
import requests
from humps import decamelize

import data.db_operations as crud
from authentication import sms_auth
from common import user_utils
from common.print_utils import pretty_print
from models import SmsSecretKeyOrm, UserOrm, UserPhoneNumberOrm

SMS_KEY_RESPONSE_FIELDS = {"expiry_date", "key", "message", "stale_date"}
USER_RESPONSE_FIELDS = {
    "email",
    "health_facility_name",
    "id",
    "name",
    "phone_numbers",
    "role",
    "sms_key",
    "username",
}
TARGET_USER_FIELDS = {
    "email",
    "id",
    "key",
    "phone_numbers",
    "sms_key",
    "username",
}


def generate_random_email(domain="example.com", length=10):
    username = "".join(random.choices(string.ascii_letters + string.digits, k=length))
    email = f"{username}@{domain}"
    return email


def generate_random_phone_number():
    phone_number = f"+1{random.randint(1000000000, 9999999999)}"
    return phone_number


def get_example_phone_number():
    phone_number_obj = phonenumbers.example_number("CA")
    assert phone_number_obj is not None
    print(phone_number_obj)
    phone_number = phonenumbers.format_number(
        phone_number_obj, phonenumbers.PhoneNumberFormat.E164
    )
    print(phone_number)
    return phone_number


def assert_user_profile_response(response):
    response_body = decamelize(response.json())
    assert set(response_body) == USER_RESPONSE_FIELDS
    assert set(response_body["sms_key"]) == SMS_KEY_RESPONSE_FIELDS


@pytest.fixture
def sms_authenticated_users(database, user_factory):
    users = []
    for sequence, user_id in enumerate((1001, 1002), start=1):
        phone_number = f"+1604555010{sequence}"
        user = user_factory.create(
            id=user_id,
            username=f"authorization_test_user_{sequence}",
            email=f"authorization_test_user_{sequence}@email.com",
            role="VHT",
        )
        user.phone_numbers.append(UserPhoneNumberOrm(phone_number=phone_number))
        user.sms_secret_keys.append(user_utils.create_new_sms_secret_key_orm())
        database.session.commit()
        access_token = sms_auth.create_sms_access_token(user.id)
        users.append((user, {"Authorization": f"Bearer {access_token}"}))
    return users


def test_register_user(auth_header):
    url_register_user = "http://localhost:5000/api/user/register"
    username = "test_register_user"
    email = "test_register@email.com"
    phone_number = "+1-604-321-9999"
    username = "test_register"
    payload = {
        "name": "Test Register User",
        "username": username,
        "email": email,
        "phone_numbers": [phone_number],
        "health_facility_name": "H0000",
        "password": "Password_123",
        "role": "VHT",
        "supervises": [],
    }
    response = requests.post(url_register_user, json=payload, headers=auth_header)
    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 200
    # Cleanup
    user_utils.delete_user(username)
    assert crud.read(UserOrm, username=username) is None


def test_edit_user(auth_header, database):
    url_edit_user = "http://localhost:5000/api/user/2"
    username = "test_vht"

    # Get test VHT.
    vht = user_utils.get_user_data_from_username(username)
    original_name = vht["name"]
    new_name = "Test Name Changed"
    vht = cast("dict[Any, Any]", vht)
    del vht["sms_key"]

    # Edit VHT
    vht["name"] = new_name
    response = requests.put(
        url_edit_user,
        json=vht,
        headers=auth_header,
    )
    database.session.commit()
    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 200
    vht = user_utils.get_user_dict_from_username(username)
    # Check that name has been changed correctly.
    assert vht["name"] == new_name

    # Change the name back.
    crud.update(UserOrm, {"name": original_name}, id=vht["id"])


def test_get_all_users(auth_header):
    url_get_all_users = "http://localhost:5000/api/user/all"

    response = requests.get(url_get_all_users, headers=auth_header)
    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 200


def test_get_current_user(auth_header):
    url_get_current_user = "http://localhost:5000/api/user/current"
    response = requests.get(url_get_current_user, headers=auth_header)
    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 200


def test_admin_can_read_another_users_profile(api_get):
    target_user = user_utils.get_user_dict_from_username("vht")

    response = api_get(endpoint=f"/api/user/{target_user['id']}")

    assert response.status_code == 200
    assert_user_profile_response(response)


@pytest.mark.parametrize("route_suffix", ["", "/phone"])
def test_user_cannot_access_another_users_data(sms_authenticated_users, route_suffix):
    _, auth_header = sms_authenticated_users[0]
    target_user, _ = sms_authenticated_users[1]
    url = f"http://localhost:5000/api/user/{target_user.id}{route_suffix}"

    response = requests.get(url, headers=auth_header)
    response_body = decamelize(response.json())

    assert response.status_code == 403
    assert TARGET_USER_FIELDS.isdisjoint(response_body)


def test_sms_secret_key_for_sms_relay(auth_header, admin_user_id):
    url_sms_secret_key_for_user = (
        f"http://localhost:5000/api/user/{admin_user_id}/smskey"
    )
    response = requests.get(url_sms_secret_key_for_user, headers=auth_header)
    response_body = decamelize(response.json())
    pretty_print(response_body)

    user = crud.read(SmsSecretKeyOrm, user_id=admin_user_id)

    assert response.status_code == 200
    assert response_body["message"] == "NORMAL"
    assert user is not None
    assert response_body["key"] == user.secret_key
    assert user.secret_key is not None and user.secret_key == response_body["key"]

    old_key = response_body["key"]

    response = requests.put(url_sms_secret_key_for_user, headers=auth_header)
    response_body = decamelize(response.json())
    pretty_print(response_body)

    assert response.status_code == 200
    assert response_body["message"] == "NORMAL"
    assert response_body["key"] is not None and response_body["key"] != old_key


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


# TODO: The tests that mutate phone numbers need to be reworked so that they restore the original state of the phone numbers.


@pytest.mark.skip(
    reason="This test should clean up after itself by removing the phone number that was added."
)
def test_user_phone_post(auth_header, user_id, new_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"

    payload = {
        "new_phone_number": new_phone_number,
        "current_phone_number": None,
        "old_phone_number": None,
    }
    response = requests.post(url_user_phone_update, json=payload, headers=auth_header)
    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 200
    assert response_body["message"] == "User phone number added successfully"


# add new_phone_number again
@pytest.mark.skip(
    reason="Our tests shouldn't depend on other tests. This test logic should be moved into the first test that adds a phone number, and the phone number should be removed at the end."
)
def test_duplicate_phone_numbers_post(auth_header, user_id, new_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"

    payload = {
        "new_phone_number": new_phone_number,
        "current_phone_number": None,
        "old_phone_number": None,
    }
    response = requests.post(url_user_phone_update, json=payload, headers=auth_header)
    response_body = decamelize(response.json())
    pretty_print(response_body)

    assert response.status_code == 400
    assert response_body["message"] == "Phone number already exists"


@pytest.mark.skip(
    reason="This test should clean up after itself by restoring the original phone numbers."
)
def test_user_phone_put(auth_header, user_id, new_phone_number, updated_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"

    payload = {
        "new_phone_number": updated_phone_number,
        "current_phone_number": new_phone_number,
        "old_phone_number": None,
    }
    response = requests.put(url_user_phone_update, json=payload, headers=auth_header)
    response_body = decamelize(response.json())
    pretty_print(response_body)

    assert response.status_code == 200
    assert response_body["message"] == "User phone number updated successfully"

    # after testing, below changes the phone number back to what it was
    payload = {
        "new_phone_number": new_phone_number,
        "current_phone_number": updated_phone_number,
        "old_phone_number": None,
    }
    response = requests.put(url_user_phone_update, json=payload, headers=auth_header)


@pytest.mark.skip(
    reason="This test should clean up after itself by restoring the deleted phone number."
)
def test_user_phone_delete(auth_header, user_id, old_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"

    payload = {
        "old_phone_number": old_phone_number,
        "current_phone_number": None,
        "new_phone_number": None,
    }
    response = requests.delete(url_user_phone_update, json=payload, headers=auth_header)
    response_body = decamelize(response.json())
    pretty_print(response_body)

    assert response.status_code == 200
    assert response_body["message"] == "User phone number deleted successfully"
