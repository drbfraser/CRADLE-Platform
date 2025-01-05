import pytest

from data import crud
from models import HealthFacilityOrm


def test_post_facility(facility_name, health_facility, api_post):
    try:
        response = api_post(endpoint="/api/facilities", json=health_facility)
        assert response.status_code == 201
        assert crud.read(HealthFacilityOrm, name=facility_name) is not None

    finally:
        crud.delete_by(HealthFacilityOrm, name=facility_name)


def test_invalid_facility_not_created(facility_name, health_facility, api_post):
    # Invalid as name is not there
    del health_facility["name"]

    response = api_post(endpoint="/api/facilities", json=health_facility)
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
    }
