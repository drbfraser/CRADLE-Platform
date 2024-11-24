import json

import requests

url = "http://localhost:5000/api/user/auth"


def test_admin_login():
    payload = {"username": "admin@email.com", "password": "cradle-admin"}

    response = requests.post(url, json=payload)
    resp_json = response.json()

    print(json.dumps(resp_json, indent=4))
    assert response.status_code == 200
    assert resp_json["access_token"] is not None
    assert resp_json["user"] is not None


def test_hcw_login():
    payload = {"username": "hcw@email.com", "password": "cradle-hcw"}

    response = requests.post(url, json=payload)
    resp_json = response.json()

    print(json.dumps(resp_json, indent=4))
    assert response.status_code == 200
    assert resp_json["access_token"] is not None
    assert resp_json["user"] is not None


def test_cho_login():
    payload = {"username": "cho@email.com", "password": "cradle-cho"}

    response = requests.post(url, json=payload)
    resp_json = response.json()

    print(json.dumps(resp_json, indent=4))
    assert response.status_code == 200
    assert resp_json["access_token"] is not None
    assert resp_json["user"] is not None


def test_vht_login():
    payload = {"username": "vht@email.com", "password": "cradle-vht"}

    response = requests.post(url, json=payload)
    resp_json = response.json()

    print(json.dumps(resp_json, indent=4))
    assert response.status_code == 200
    assert resp_json["access_token"] is not None
    assert resp_json["user"] is not None


def test_invalid_login():
    payload = {"username": "admin@email.com", "password": "Wrong_Password"}

    response = requests.post(url, json=payload)
    resp_json = response.json()

    print(json.dumps(resp_json, indent=4))
    assert response.status_code == 401
    assert resp_json["message"] == "Incorrect username or password."
