import time

import pytest
from humps import decamelize

import data.db_operations as crud
from common.print_utils import pretty_print
from models import HealthFacilityOrm


def test_post_facility(facility_name, health_facility, api_post):
    health_facility["newReferrals"] = "client-time"
    before_request = round(time.time() * 1000)
    try:
        response = api_post(endpoint="/api/facilities", json=health_facility)
        assert response.status_code == 201
        response_body = decamelize(response.json())
        facility = crud.read(HealthFacilityOrm, name=facility_name)
        assert facility is not None
        assert (
            before_request <= int(facility.new_referrals) <= round(time.time() * 1000)
        )
        assert int(response_body["new_referrals"]) == int(facility.new_referrals)
        assert facility.location == health_facility["location"]
        assert facility.about == health_facility["about"]
        assert facility.type == health_facility["type"]
    finally:
        crud.delete_by(HealthFacilityOrm, name=facility_name)


def test_invalid_facility_not_created(facility_name, health_facility, api_post):
    # Invalid as name is not there
    del health_facility["name"]

    response = api_post(endpoint="/api/facilities", json=health_facility)
    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 422
    assert crud.read(HealthFacilityOrm, name=facility_name) is None


@pytest.fixture
def facility_name():
    return "H1001"


@pytest.fixture
def health_facility(facility_name):
    return {
        "name": facility_name,
        "phone_number": "604-715-2845",
        "about": "Biggest hospital",
        "type": "HOSPITAL",
        "location": "Kampala",
    }
