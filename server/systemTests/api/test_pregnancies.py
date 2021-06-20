import pytest

import data.crud as crud
from models import Pregnancy
from utils import get_current_time


def test_get_pregnancy(
    pregnancy_factory, patient_factory, patient_id, preganancy_earlier, api_get
):
    # patient_factory.create(patientId=patient_id)

    pregnancy_factory.create(**preganancy_earlier)

    pregnancy_id = preganancy_earlier["id"]
    response = api_get(endpoint=f"/api/pregnancies/{pregnancy_id}")

    assert response.status_code == 200
    assert preganancy_earlier == response.json()


def test_put_pregnancy(pregnancy_factory, preganancy_later, api_put):
    pregnancy_factory.create(**preganancy_later)

    pregnancy_id = preganancy_later["id"]
    end_date = 1623737526
    outcome = "Mode of delivery: assisted birth"
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"endDate": end_date, "outcome": outcome},
    )

    new_pregnancy = crud.read(Pregnancy, id=pregnancy_id)

    assert response.status_code == 200
    assert new_pregnancy.endDate == end_date
    assert new_pregnancy.outcome == outcome


def test_post_pregnancy(pregnancy_factory, patient_id, preganancy_later, api_post):
    pregnancy_factory.create(**preganancy_later)

    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=preganancy_later,
    )

    pregnancy_id = preganancy_later["id"]
    new_pregnancy = crud.read(Pregnancy, id=pregnancy_id)

    assert response.status_code == 201
    assert new_pregnancy.patientId == patient_id
    assert new_pregnancy.startDate == preganancy_later["startDate"]


@pytest.fixture
def patient_id():
    return "49300028162"


@pytest.fixture
def preganancy_earlier(patient_id):
    return {
        "id": 72,
        "patientId": patient_id,
        "startDate": 1561011126,
        "defaultTimeUnit": "MONTHS",
        "endDate": 1584684726,
        "outcome": "Mode of delivery: forceps",
        "lastEdited": 1584684726,
    }


@pytest.fixture
def preganancy_later(patient_id):
    return {
        "id": 73,
        "patientId": patient_id,
        "startDate": 1600150326,
        "defaultTimeUnit": "WEEKS",
    }
