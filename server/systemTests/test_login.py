import json

import requests
from humps import decamelize

url = "http://localhost:5000/api/user/auth"


def test_admin_login():
    payload = {"username": "admin@email.com", "password": "cradle-admin"}

    response = requests.post(url, json=payload)
    response_body = decamelize(response.json())

    print(json.dumps(response_body, indent=4))
    assert response.status_code == 200
    assert response_body["access_token"] is not None
    assert response_body["user"] is not None


def test_hcw_login():
    payload = {"username": "hcw@email.com", "password": "cradle-hcw"}

    response = requests.post(url, json=payload)
    response_body = decamelize(response.json())

    print(json.dumps(response_body, indent=4))
    assert response.status_code == 200
    assert response_body["access_token"] is not None
    assert response_body["user"] is not None


def test_cho_login():
    payload = {"username": "cho@email.com", "password": "cradle-cho"}

    response = requests.post(url, json=payload)
    response_body = decamelize(response.json())

    print(json.dumps(response_body, indent=4))
    assert response.status_code == 200
    assert response_body["access_token"] is not None
    assert response_body["user"] is not None


def test_vht_login():
    payload = {"username": "vht@email.com", "password": "cradle-vht"}

    response = requests.post(url, json=payload)
    response_body = decamelize(response.json())

    print(json.dumps(response_body, indent=4))
    assert response.status_code == 200
    assert response_body["access_token"] is not None
    assert response_body["user"] is not None


def test_invalid_login():
    payload = {"username": "admin@email.com", "password": "Wrong_Password"}

    response = requests.post(url, json=payload)
    response_body = decamelize(response.json())

    print(json.dumps(response_body, indent=4))
    assert response.status_code == 401
