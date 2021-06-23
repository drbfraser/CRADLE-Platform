import pytest

import data.crud as crud
from models import Pregnancy


def test_get_pregnancy(pregnancy_factory, pregnancy_earlier, api_get):
    # patient_factory.create(patientId=patient_id)
    pregnancy_factory.create(**pregnancy_earlier)

    pregnancy_id = pregnancy_earlier["id"]
    response = api_get(endpoint=f"/api/pregnancies/{pregnancy_id}")

    assert response.status_code == 200
    assert response.json() == pregnancy_earlier


def test_put_pregnancy(pregnancy_factory, pregnancy_later, api_put):
    pregnancy_factory.create(**pregnancy_later)

    pregnancy_id = pregnancy_later["id"]
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


def test_post_pregnancy(patient_id, pregnancy_later, api_post):
    try:
        response = api_post(
            endpoint=f"/api/patients/{patient_id}/pregnancies",
            json=pregnancy_later,
        )

        pregnancy_id = pregnancy_later["id"]
        new_pregnancy = crud.read(Pregnancy, id=pregnancy_id)

        assert response.status_code == 201
        assert new_pregnancy.patientId == patient_id
        assert new_pregnancy.startDate == pregnancy_later["startDate"]

    finally:
        crud.delete_by(Pregnancy, id=pregnancy_id)


def test_get_pregnancy_list(
    pregnancy_factory, patient_id, pregnancy_earlier, pregnancy_later, api_get
):
    pregnancy_factory.create(**pregnancy_earlier)
    pregnancy_factory.create(**pregnancy_later)

    response = api_get(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
    )

    assert response.status_code == 200
    assert len(response.json()) >= 2


def test_get_pregnancy_status(
    pregnancy_factory, patient_id, pregnancy_earlier, pregnancy_later, api_get
):
    pregnancy_factory.create(**pregnancy_earlier)
    pregnancy_factory.create(**pregnancy_later)

    response = api_get(
        endpoint=f"/api/patients/{patient_id}/pregnancies/status",
    )

    pregnancy_later["isPregnant"] = True

    assert response.status_code == 200
    assert response.json() == pregnancy_later


def test_invalid_pregnancy_not_updated(pregnancy_factory, pregnancy_later, api_put):
    pregnancy_factory.create(**pregnancy_later)

    pregnancy_id = pregnancy_later["id"]
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"patientId": "0"},
    )

    pregnancy = crud.read(Pregnancy, id=pregnancy_id)

    assert response.status_code == 400
    assert pregnancy.patientId == pregnancy_later["patientId"]


def test_invalid_pregnancy_not_created(
    pregnancy_factory, patient_id, pregnancy_later, api_post
):
    pregnancy_factory.create(**pregnancy_later)

    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy_later,
    )

    assert response.status_code == 409
