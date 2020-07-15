from typing import Callable, Tuple

import pytest
import requests

import SystemTests.mock.factory as factory


#
# Database Fixtures
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

    Tests may override these credentials on an individual basis using the
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
    return "admin123@admin.com", "admin123"


@pytest.fixture
def bearer_token(url: str, credentials: Tuple[str, str]) -> str:
    """
    Provides a bearer token my making an API request to authenticate the given
    credentials.

    :return: A bearer token
    """
    url = f"{url}/api/user/auth"
    payload = {"email": credentials[0], "password": credentials[1]}
    response = requests.post(url, json=payload)
    resp_json = response.json()
    return resp_json["token"]


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


#
# Model Factory Fixtures
#


@pytest.fixture
def patient_factory(database) -> factory.ReadingFactory:
    yield from __make_factory(database, factory.PatientFactory)


@pytest.fixture
def reading_factory(database) -> factory.ReadingFactory:
    yield from __make_factory(database, factory.ReadingFactory)


@pytest.fixture
def referral_factory(database) -> factory.ReferralFactory:
    yield from __make_factory(database, factory.ReferralFactory)


@pytest.fixture
def followup_factory(database) -> factory.FollowUpFactory:
    yield from __make_factory(database, factory.FollowUpFactory)


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
