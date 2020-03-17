import requests

url = 'http://localhost:5000/api/user'
headers = {
    
}
def test_get_all_patients():
    payload = {
        'email': 'admin123@admin.com',
        'password': 'admin123'
    }

    response = requests.post(url, json=payload)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200


