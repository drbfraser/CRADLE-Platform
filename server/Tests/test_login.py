import requests
import json

url = 'http://localhost:5000/api/user/auth'
def test_admin_login():
    payload = {
        'email': 'admin123@admin.com',
        'password': 'admin123'
    }

    response = requests.post(url, json=payload)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200
    assert resp_body['token'] is not None
    assert resp_body['refresh'] is not None
    assert resp_body['isLoggedIn'] is True


def test_hcw_login():
    payload = {
        'email': 'hcw@hcw.com',
        'password': 'hcw123'
    }

    response = requests.post(url, json=payload)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200
    assert resp_body['token'] is not None
    assert resp_body['refresh'] is not None
    assert resp_body['isLoggedIn'] is True

def test_cho_login():
    payload = {
        'email': 'cho@cho.com',
        'password': 'cho123'
    }

    response = requests.post(url, json=payload)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200
    assert resp_body['token'] is not None
    assert resp_body['refresh'] is not None
    assert resp_body['isLoggedIn'] is True

def test_vht_login():
    payload = {
        'email': 'vht@vht.com',
        'password': 'vht123'
    }

    response = requests.post(url, json=payload)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200
    assert resp_body['token'] is not None
    assert resp_body['refresh'] is not None
    assert resp_body['isLoggedIn'] is True