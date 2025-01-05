from typing import Callable, Tuple

import pytest
import requests
from flask import Flask
from humps import decamelize

from systemTests.mock import factory


@pytest.fixture
def app():
    from config import app
    # from manage import seed

    app.config.update({"TESTING": True})
    app.logger.disabled = True

    yield app

    # Cleanup.
    app.logger.disabled = False
    app.config.update({"TESTING": False})


@pytest.fixture(autouse=True)
def _provide_app_context(app: Flask):
    with app.app_context():
        yield


#
# database Fixtures
#


@pytest.fixture
def database():
    """
    Provides an instance of the database.

    :return: A database instance
    """
    from config import db

    return db


#
# Web API Interface Fixtures
#


@pytest.fixture
def url() -> str:
    """
    Provides the base URL of the server.

    :return: A url
    """
    return "http://localhost:5000"


@pytest.fixture
def credentials() -> Tuple[str, str]:
    """
    Provides the user credentials used to perform API requests.

    tests may override these credentials on an individual basis using the
    ``@pytest.mark.parametrize`` decorator. For example::

        @pytest.mark.parametrize("credentials", [("foo", "bar")])
        def test_foo(credentials):
            assert credentials[0] == "foo"
            assert credentials[1] == "bar"

    Note that this even works if the test doesn't directly depend on the ``credentials``
    fixture::

        @pytest.mark.parametrize("credentials", [("vht@vht.com", "vht123")])
        def test_get_as_vht(api_get):
            # Request is made using the credentials provided in the decorator
            response = api_get(endpoint="/api/hello_world")
            # ...

    :return: A tuple containing an email and password
    """
    return "admin@email.com", "cradle-admin"


@pytest.fixture
def bearer_token(url: str, credentials: Tuple[str, str]) -> str:
    """
    Provides a bearer token my making an API request to authenticate the given
    credentials.

    :return: A bearer token
    """
    url = f"{url}/api/user/auth"
    payload = {"username": credentials[0], "password": credentials[1]}
    response = requests.post(url, json=payload)
    response_body = decamelize(response.json())
    return response_body["access_token"]


@pytest.fixture
def auth_header(bearer_token: str) -> dict:
    """
    Provides an HTTP header pre-loaded with a bearer token for authentication.

    :return: An HTTP header
    """
    return {"Authorization": f"Bearer {bearer_token}"}


@pytest.fixture
def api_get(url: str, auth_header: dict) -> Callable[[str, dict], requests.Response]:
    """
    Provides a convenience closure which sends an HTTP GET request to the server at a
    given endpoint.

    :return: A closure that accepts two arguments, an endpoint and some optional json
             to send in the request.
    """
    return __make_http_request_closure(url, auth_header, requests.get)


@pytest.fixture
def api_post(url: str, auth_header: dict) -> Callable[[str, dict], requests.Response]:
    """
    Provides a convenience closure which sends an HTTP POST request to the server at a
    given endpoint.

    :return: A closure that accepts two arguments, an endpoint and some optional json
             to send in the request.
    """
    return __make_http_request_closure(url, auth_header, requests.post)


@pytest.fixture
def api_put(url: str, auth_header: dict) -> Callable[[str, dict], requests.Response]:
    """
    Provides a convenience closure which sends an HTTP PUT request to the server at a
    given endpoint.

    :return: A closure that accepts two arguments, an endpoint and some optional json
             to send in the request.
    """
    return __make_http_request_closure(url, auth_header, requests.put)


@pytest.fixture
def api_delete(url: str, auth_header: dict) -> Callable[[str, dict], requests.Response]:
    """
    Provides a convenience closure which sends an HTTP DELETE request to the server at a
    given endpoint.

    :return: A closure that accepts two arguments, an endpoint and some optional json
             to send in the request.
    """
    return __make_http_request_closure(url, auth_header, requests.delete)


@pytest.fixture
def api(url: str):
    class Api:
        @staticmethod
        def get(
            endpoint: str,
            email: str = "admin@email.com",
            password: str = "admin",
        ):
            return Api.__make_request(requests.get, endpoint, {}, email, password)

        @staticmethod
        def post(
            endpoint: str,
            payload: dict,
            email: str = "admin@email.com",
            password: str = "admin",
        ):
            return Api.__make_request(requests.post, endpoint, payload, email, password)

        @staticmethod
        def put(
            endpoint: str,
            payload: dict,
            email: str = "admin@email.com",
            password: str = "admin",
        ):
            return Api.__make_request(requests.put, endpoint, payload, email, password)

        @staticmethod
        def __get_bearer_token(email: str, password: str):
            u = f"{url}/api/user/auth"
            payload = {"username": email, "password": password}
            response = requests.post(u, json=payload)
            response_body = decamelize(response.json())
            return response_body["access_token"]

        @staticmethod
        def __make_request(
            func,
            endpoint: str,
            payload: dict,
            email: str,
            password: str,
        ):
            token = Api.__get_bearer_token(email, password)
            header = {"Authorization": f"Bearer {token}"}
            return func(f"{url}{endpoint}", headers=header, json=payload)

    return Api


#
# Model Factory Fixtures
#


@pytest.fixture
def patient_factory(database) -> factory.PatientFactory:
    yield from __make_factory(database, factory.PatientFactory)


@pytest.fixture
def reading_factory(database) -> factory.ReadingFactory:
    yield from __make_factory(database, factory.ReadingFactory)


@pytest.fixture
def referral_factory(database) -> factory.ReferralFactory:
    yield from __make_factory(database, factory.ReferralFactory)


@pytest.fixture
def followup_factory(database) -> factory.AssessmentFactory:
    yield from __make_factory(database, factory.AssessmentFactory)


@pytest.fixture
def user_factory(database) -> factory.UserFactory:
    yield from __make_factory(database, factory.UserFactory)


@pytest.fixture
def facility_factory(database) -> factory.HealthFacilityFactory:
    yield from __make_factory(database, factory.HealthFacilityFactory)


@pytest.fixture
def pregnancy_factory(database) -> factory.PregnancyFactory:
    yield from __make_factory(database, factory.PregnancyFactory)


@pytest.fixture
def medical_record_factory(database) -> factory.MedicalRecordFactory:
    yield from __make_factory(database, factory.MedicalRecordFactory)


@pytest.fixture
def form_template_factory(database) -> factory.FormTemplateFactory:
    yield from __make_factory(database, factory.FormTemplateFactory)


#
# Generic Maker Functions
#


def __make_factory(database, factory_type) -> factory.ModelFactory:
    f = factory_type(database)
    yield f
    f.cleanup()


def __make_http_request_closure(url, headers, func):
    def __closure(endpoint, json=None):
        if json is None:
            json = {}
        return func(url=f"{url}{endpoint}", headers=headers, json=json)

    return __closure
