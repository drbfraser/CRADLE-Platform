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
        "outcome": "Mode of delivery: forceps",
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
def medical_hisory():
    return """
        Pregnancy induced hypertension - onset 5 months
        Started on Labetalol 200mg three times daily two weeks ago.
        Dose increased to 300mg three times daily yesterday.
    """


@pytest.fixture
def drug_hisory():
    return """
        No known drug allergies.
        Aspirin 75mg
        Labetalol 300mg three times daily.
    """


@pytest.fixture
def medical_record(patient_id, medical_hisory):
    return {
        "id": 60360714,
        "patientId": patient_id,
        "information": medical_hisory,
        "isDrugRecord": False,
    }


@pytest.fixture
def drug_record(patient_id, drug_hisory):
    return {
        "id": 60360715,
        "patientId": patient_id,
        "information": drug_hisory,
        "isDrugRecord": True,
    }
