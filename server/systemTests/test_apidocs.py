import requests


def test_apidocs_are_accessible():
    """
    Test if the swagger api documentation(accessible at http://localhost:5000/apidocs) is working.

    This check ensures we don't forget to update `Cradle-Platform/server/specifications` when making changes
    to api routes
    """
    response = requests.get("http://localhost:5000/apispec_1.json")

    assert response.status_code == 200
