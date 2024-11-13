import datetime

from data import crud
from models import PregnancyOrm

approx_8_months = int(datetime.timedelta(days=8 * 30).total_seconds())
approx_1_month = int(datetime.timedelta(days=30).total_seconds())


def test_get_pregnancy(create_patient, pregnancy_factory, pregnancy_earlier, api_get):
    create_patient()
    pregnancy_factory.create(**pregnancy_earlier)

    pregnancy_id = pregnancy_earlier["id"]
    response = api_get(endpoint=f"/api/pregnancies/{pregnancy_id}")

    assert response.status_code == 200

    expected = {
        "id": pregnancy_id,
        "patient_id": pregnancy_earlier["patient_id"],
        "start_date": pregnancy_earlier["start_date"],
        "end_date": pregnancy_earlier["end_date"],
        "outcome": pregnancy_earlier["outcome"],
    }

    response_body = response.json()
    del response_body["last_edited"]
    assert response_body == expected


def test_put_pregnancy(create_patient, pregnancy_factory, pregnancy_later, api_put):
    create_patient()
    pregnancy_factory.create(**pregnancy_later)

    pregnancy_id = pregnancy_later["id"]
    end_date = pregnancy_later["start_date"] + approx_8_months
    outcome = "Baby born at 8 months."
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"end_date": end_date, "outcome": outcome},
    )

    new_pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)

    assert response.status_code == 200
    assert new_pregnancy.end_date == end_date
    assert new_pregnancy.outcome == outcome


def test_post_and_delete_pregnancy(
    create_patient,
    patient_id,
    pregnancy_later,
    database,
    api_post,
    api_delete,
):
    create_patient()
    pregnancy_id = pregnancy_later["id"]

    pregnancy = {
        "id": pregnancy_id,
        "start_date": pregnancy_later["start_date"],
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    new_pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)

    assert response.status_code == 201
    assert new_pregnancy.patient_id == patient_id
    assert new_pregnancy.start_date == pregnancy_later["start_date"]

    response = api_delete(endpoint=f"/api/pregnancies/{pregnancy_id}")
    database.session.commit()

    assert response.status_code == 200
    assert crud.read(PregnancyOrm, id=pregnancy_id) is None


def test_get_pregnancy_list(
    create_patient,
    pregnancy_factory,
    patient_id,
    pregnancy_earlier,
    pregnancy_later,
    api_get,
):
    create_patient()
    pregnancy_factory.create(**pregnancy_earlier)
    pregnancy_factory.create(**pregnancy_later)

    response = api_get(endpoint=f"/api/patients/{patient_id}/pregnancies")

    assert response.status_code == 200
    assert len(response.json()) >= 2


def test_invalid_pregnancy_not_updated(
    create_patient,
    pregnancy_factory,
    pregnancy_earlier,
    pregnancy_later,
    api_put,
):
    create_patient()
    pregnancy_factory.create(**pregnancy_earlier)

    pregnancy_id = pregnancy_earlier["id"]
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"patient_id": "0"},
    )

    pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)

    assert response.status_code == 400
    assert pregnancy.patient_id == pregnancy_earlier["patient_id"]

    pregnancy_factory.create(**pregnancy_later)

    pregnancy_id = pregnancy_later["id"]
    start_date = pregnancy_earlier["end_date"] - approx_1_month
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"start_date": start_date},
    )

    pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)

    assert response.status_code == 409
    assert pregnancy.start_date == pregnancy_later["start_date"]

    pregnancy_id = pregnancy_earlier["id"]
    end_date = pregnancy_later["start_date"] + approx_1_month
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"end_date": end_date},
    )

    pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)

    assert response.status_code == 409
    assert pregnancy.end_date == pregnancy_earlier["end_date"]


def test_invalid_pregnancy_not_created(
    create_patient,
    pregnancy_factory,
    patient_id,
    pregnancy_earlier,
    api_post,
):
    create_patient()
    pregnancy_factory.create(**pregnancy_earlier)

    start_date = pregnancy_earlier["end_date"] + approx_1_month
    pregnancy = {
        "id": pregnancy_earlier["id"],
        "start_date": start_date,
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    assert response.status_code == 409
    assert crud.read(PregnancyOrm, patient_id=patient_id, start_date=start_date) is None

    start_date = pregnancy_earlier["end_date"] - approx_1_month
    pregnancy = {
        "start_date": start_date,
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    assert response.status_code == 409
    assert crud.read(PregnancyOrm, patient_id=patient_id, start_date=start_date) is None

    end_date = pregnancy_earlier["start_date"] + approx_1_month
    start_date = end_date - approx_8_months
    pregnancy = {
        "start_date": start_date,
        "end_date": end_date,
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    assert response.status_code == 409
    assert crud.read(PregnancyOrm, patient_id=patient_id, start_date=start_date) is None
