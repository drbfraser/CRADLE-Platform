import pytest

import data.crud as crud
from models import Pregnancy


def test_get_pregnancy(pregnancy_factory, pregnancy_earlier, api_get):
    # patient_factory.create(patientId=patient_id)
    pregnancy_factory.create(**pregnancy_earlier)

    pregnancy_id = pregnancy_earlier["id"]
    response = api_get(endpoint=f"/api/pregnancies/{pregnancy_id}")

    assert response.status_code == 200

    expected = {
        "id": pregnancy_id,
        "patientId": pregnancy_earlier["patientId"],
        "pregnancyStartDate": pregnancy_earlier["startDate"],
        "gestationalAgeUnit": pregnancy_earlier["defaultTimeUnit"],
        "pregnancyEndDate": pregnancy_earlier["endDate"],
        "pregnancyOutcome": pregnancy_earlier["outcome"],
    }

    response_body = response.json()
    del response_body["lastEdited"]
    assert response_body == expected


def test_put_pregnancy(pregnancy_factory, pregnancy_later, api_put):
    pregnancy_factory.create(**pregnancy_later)

    pregnancy_id = pregnancy_later["id"]
    end_date = pregnancy_later["startDate"] + 2e7
    outcome = "Baby born at 8 months."
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"pregnancyEndDate": end_date, "pregnancyOutcome": outcome},
    )

    new_pregnancy = crud.read(Pregnancy, id=pregnancy_id)

    assert response.status_code == 200
    assert new_pregnancy.endDate == end_date
    assert new_pregnancy.outcome == outcome


def test_post_and_delete_pregnancy(
    patient_id, pregnancy_later, database, api_post, api_delete
):
    pregnancy_id = pregnancy_later["id"]

    pregnancy = {
        "id": pregnancy_id,
        "pregnancyStartDate": pregnancy_later["startDate"],
        "gestationalAgeUnit": pregnancy_later["defaultTimeUnit"],
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    new_pregnancy = crud.read(Pregnancy, id=pregnancy_id)

    assert response.status_code == 201
    assert new_pregnancy.patientId == patient_id
    assert new_pregnancy.startDate == pregnancy_later["startDate"]
    assert new_pregnancy.defaultTimeUnit.value == pregnancy_later["defaultTimeUnit"]

    response = api_delete(endpoint=f"/api/pregnancies/{pregnancy_id}")
    database.session.commit()

    assert response.status_code == 200
    assert crud.read(Pregnancy, id=pregnancy_id) is None


def test_get_pregnancy_list(
    pregnancy_factory, patient_id, pregnancy_earlier, pregnancy_later, api_get
):
    pregnancy_factory.create(**pregnancy_earlier)
    pregnancy_factory.create(**pregnancy_later)

    response = api_get(endpoint=f"/api/patients/{patient_id}/pregnancies")

    assert response.status_code == 200
    assert len(response.json()) >= 2


def test_invalid_pregnancy_not_updated(
    pregnancy_factory, pregnancy_earlier, pregnancy_later, api_put
):
    pregnancy_factory.create(**pregnancy_earlier)

    pregnancy_id = pregnancy_earlier["id"]
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"patientId": "0"},
    )

    pregnancy = crud.read(Pregnancy, id=pregnancy_id)

    assert response.status_code == 400
    assert pregnancy.patientId == pregnancy_earlier["patientId"]

    pregnancy_factory.create(**pregnancy_later)

    pregnancy_id = pregnancy_later["id"]
    start_date = pregnancy_earlier["endDate"] - 3e6
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"pregnancyStartDate": start_date},
    )

    pregnancy = crud.read(Pregnancy, id=pregnancy_id)

    assert response.status_code == 409
    assert pregnancy.startDate == pregnancy_later["startDate"]

    pregnancy_id = pregnancy_earlier["id"]
    end_date = pregnancy_later["startDate"] + 3e6
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"pregnancyEndDate": end_date},
    )

    pregnancy = crud.read(Pregnancy, id=pregnancy_id)

    assert response.status_code == 409
    assert pregnancy.endDate == pregnancy_earlier["endDate"]


def test_invalid_pregnancy_not_created(
    pregnancy_factory, patient_id, pregnancy_earlier, api_post
):
    pregnancy_factory.create(**pregnancy_earlier)
    unit = pregnancy_earlier["defaultTimeUnit"]

    start_date = pregnancy_earlier["endDate"] + 3e6
    pregnancy = {
        "id": pregnancy_earlier["id"],
        "pregnancyStartDate": start_date,
        "gestationalAgeUnit": unit,
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    assert response.status_code == 409
    assert crud.read(Pregnancy, patientId=patient_id, startDate=start_date) is None

    start_date = pregnancy_earlier["endDate"] - 3e6
    pregnancy = {
        "pregnancyStartDate": start_date,
        "gestationalAgeUnit": unit,
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    assert response.status_code == 409
    assert crud.read(Pregnancy, patientId=patient_id, startDate=start_date) is None

    end_date = pregnancy_earlier["startDate"] + 3e6
    start_date = end_date - 2e7
    pregnancy = {
        "pregnancyStartDate": start_date,
        "gestationalAgeUnit": unit,
        "pregnancyEndDate": end_date,
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    assert response.status_code == 409
    assert crud.read(Pregnancy, patientId=patient_id, startDate=start_date) is None
