import pytest
import requests
import json
import random
from manage import getRandomInitials


def get_login_token(email, password):
    url = "http://localhost:5000/api/user/auth"
    payload = {"email": email, "password": password}

    response = requests.post(url, json=payload)
    resp_json = response.json()
    return resp_json["token"]


def get_bearer_token(email, password):
    return "Bearer {}".format(get_login_token(email, password))


def get_authorization_header(email, password):
    auth = {"Authorization": get_bearer_token(email, password)}
    return auth


BASE_URL = "http://localhost:5000"
auth_header_hcw = get_authorization_header("hcw@hcw.com", "hcw123")


def get_random_patient_id():
    return str(random.randint(48300000000, 48300099999))


# # Testing global search API
# def test_pass_search_partial_patient_id():
#     partial_patient_id = "483"
#     url = BASE_URL + "/api/patient/global/" + partial_patient_id
#     response = requests.get(url, headers=auth_header_hcw)
#     response_body = response.json()
#     assert response.status_code == 200
#     expected_matching_patients = 6
#     assert len(response_body) == expected_matching_patients


def test_pass_search_partial_initials():
    partial_patient_initials = "A"
    url = BASE_URL + "/api/patient/global/" + partial_patient_initials
    response = requests.get(url, headers=auth_header_hcw)
    response_body = response.json()
    assert response.status_code == 200
    expected_matching_patients = 1
    # cannot determine exact amount because we are creating patients with random initials in some tests
    # to-do: change existing tests make them enter non-random data
    assert len(response_body) >= expected_matching_patients


def test_pass_search_full_patient_id():
    full_patient_id = "48300028162"
    url = BASE_URL + "/api/patient/global/" + full_patient_id
    response = requests.get(url, headers=auth_header_hcw)
    response_body = response.json()
    assert response.status_code == 200
    expected_matching_patients = 1
    assert len(response_body) == expected_matching_patients


def test_pass_search_full_initials():
    full_patient_initials = "BB"
    url = BASE_URL + "/api/patient/global/" + full_patient_initials
    response = requests.get(url, headers=auth_header_hcw)
    response_body = response.json()
    assert response.status_code == 200
    expected_matching_patients = 1
    assert len(response_body) == expected_matching_patients


def test_no_id_matches():
    full_patient_id = "9872"
    url = BASE_URL + "/api/patient/global/" + full_patient_id
    response = requests.get(url, headers=auth_header_hcw)
    response_body = response.json()
    assert response.status_code == 200
    assert response_body == []


def test_no_initials_matches():
    full_initials = "CCC"
    url = BASE_URL + "/api/patient/global/" + full_initials
    response = requests.get(url, headers=auth_header_hcw)
    response_body = response.json()
    assert response.status_code == 200
    assert response_body == []
