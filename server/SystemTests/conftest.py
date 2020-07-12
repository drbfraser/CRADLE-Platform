import pytest
import requests
import SystemTests.mock.factory as factory
from typing import Callable


#
# Database Fixtures
#


@pytest.fixture
def database():
    from config import db

    return db


#
# Web API Interface Fixtures
#


@pytest.fixture
def url() -> str:
    return "http://localhost:5000"


@pytest.fixture
def bearer_token(url: str) -> str:
    url = f"{url}/api/user/auth"
    payload = {"email": "admin123@admin.com", "password": "admin123"}
    response = requests.post(url, json=payload)
    resp_json = response.json()
    return resp_json["token"]


@pytest.fixture
def auth_header(bearer_token: str) -> dict:
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


@pytest.fixture
def user_factory(database) -> factory.UserFactory:
    yield from __make_factory(database, factory.UserFactory)


@pytest.fixture
def facility_factory(database) -> factory.HealthFacilityFactory:
    yield from __make_factory(database, factory.HealthFacilityFactory)

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
