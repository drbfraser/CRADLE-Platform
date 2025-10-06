import pytest
from common.commonUtil import get_uuid
from enums import SexEnum, FacilityTypeEnum, RoleEnum

# ---------- Helpers ----------
ISO = "2020-01-01"


def _uuid():
    return get_uuid()


# ---------- Core payload fixtures ----------


@pytest.fixture
def patient_info():
    return {
        "id": _uuid(),
        "name": "Mary Brown",
        "sex": SexEnum.FEMALE,
        "is_pregnant": True,
        "household_number": "1234",
        "zone": "1",
        "allergy": "Peanuts",
        "drug_history": "Tylenol",
        "medical_history": "Asthma",
        "last_edited": ISO,
        "date_created": ISO,
        "is_archived": False,
        "date_of_birth": "1998-01-01",
        "is_exact_date_of_birth": False,
        "village_number": "1001",
    }


@pytest.fixture
def health_facility_info():
    return {
        "id": _uuid(),
        "name": "Health Facility 1",
        "type": FacilityTypeEnum.HCF_2,
        "phone_number": "+16047152845",
        "location": "Kampala",
        "about": "Largest hospital",
    }


@pytest.fixture
def user_info(health_facility_info):
    return {
        "id": _uuid(),
        "name": "testuser",
        "username": "test_username",
        "email": "test_email@example.com",
        "role": RoleEnum.VHT,
        "health_facility_id": health_facility_info["id"],
    }


@pytest.fixture
def patient_association_info(patient_info, health_facility_info, user_info):
    return {
        "id": _uuid(),
        "patient_id": patient_info["id"],
        "health_facility_id": health_facility_info["id"],
        "user_id": user_info["id"],
    }


@pytest.fixture
def pregnancy_info(patient_info):
    return {
        "id": _uuid(),
        "pregnancy_start_date": ISO,
        "pregnancy_end_date": ISO,
        "outcome": "Mode of delivery: assisted birth",
        "patient_id": patient_info["id"],
    }


@pytest.fixture
def form_classification_info():
    return {
        "id": _uuid(),
        "name": "Test Form Classification",
    }


@pytest.fixture
def form_template_info(form_classification_info):
    return {
        "id": _uuid(),
        "date_created": ISO,
        "archived": False,
        "form_classification_id": form_classification_info["id"],
    }


@pytest.fixture
def form_info(form_template_info, patient_info, user_info, form_classification_info):
    return {
        "id": _uuid(),
        "lang": "en",
        "name": "Test Form",
        "category": "Category",
        "date_created": ISO,
        "last_edited": ISO,
        "patient_id": patient_info["id"],
        "form_template_id": form_template_info["id"],
        "last_edited_by": user_info["id"],
        "form_classification_id": form_classification_info["id"],
    }
