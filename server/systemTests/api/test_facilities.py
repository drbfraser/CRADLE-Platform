import pytest

from data import crud
from models import HealthFacilityOrm


def test_post_facility(facility_name, health_facility, api_post):
    try:
        response = api_post(endpoint="/api/facilities", json=health_facility)
        assert response.status_code == 201
        assert crud.read(HealthFacilityOrm, healthFacilityName=facility_name) is not None

    finally:
        crud.delete_by(HealthFacilityOrm, healthFacilityName=facility_name)


def test_invalid_facility_not_created(facility_name, health_facility, api_post):
    # Invalid as healthFacilityName is not there
    del health_facility["healthFacilityName"]

    response = api_post(endpoint="/api/facilities", json=health_facility)
    assert response.status_code == 400
    assert crud.read(HealthFacilityOrm, healthFacilityName=facility_name) is None


@pytest.fixture
def facility_name():
    return "H1001"


@pytest.fixture
def health_facility(facility_name):
    return {
        "healthFacilityName": facility_name,
        "healthFacilityPhoneNumber": "444-444-4444",
        "about": "Biggest hospital",
        "facilityType": "HOSPITAL",
    }
