import requests


def test_apidocs_are_accessible():
    """
    Test if the API documentation (accessible at http://localhost:5000/apidocs) is working.

    """
    response = requests.get("http://localhost:5000/apidocs/openapi.json")

    assert response.status_code == 200
