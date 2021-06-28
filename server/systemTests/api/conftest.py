import pytest


@pytest.fixture
def patient_id():
    return "49300028163"


@pytest.fixture
def pregnancy_earlier(patient_id):
    return {
        "id": 60360714,
        "patientId": patient_id,
        "startDate": 1561011126,
        "defaultTimeUnit": "MONTHS",
        "endDate": 1584684726,
        "outcome": "Baby born at 9 months - spontaneous vaginal delivery. Baby weighed 3kg.",
    }


@pytest.fixture
def pregnancy_later(patient_id):
    return {
        "id": 60360715,
        "patientId": patient_id,
        "startDate": 1600150326,
        "defaultTimeUnit": "WEEKS",
    }


@pytest.fixture
def medical_record(patient_id):
    return {
        "id": 60360716,
        "patientId": patient_id,
        "information": "Pregnancy induced hypertension - onset 5 months.",
        "isDrugRecord": False,
    }


@pytest.fixture
def drug_record(patient_id):
    return {
        "id": 60360717,
        "patientId": patient_id,
        "information": "Labetalol 300mg three times daily.",
        "isDrugRecord": True,
    }
