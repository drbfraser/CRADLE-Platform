import data.crud as crud
from models import Pregnancy
import datetime


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
        "patientId": pregnancy_earlier["patientId"],
        "pregnancyStartDate": pregnancy_earlier["startDate"],
        "gestationalAgeUnit": pregnancy_earlier["defaultTimeUnit"],
        "pregnancyEndDate": pregnancy_earlier["endDate"],
        "pregnancyOutcome": pregnancy_earlier["outcome"],
    }

    response_body = response.json()
    del response_body["lastEdited"]
    assert response_body == expected


def test_put_pregnancy(create_patient, pregnancy_factory, pregnancy_later, api_put):
    create_patient()
    pregnancy_factory.create(**pregnancy_later)

    pregnancy_id = pregnancy_later["id"]
    end_date = pregnancy_later["startDate"] + approx_8_months
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
    create_patient, patient_id, pregnancy_later, database, api_post, api_delete
):
    create_patient()
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
    create_patient, pregnancy_factory, pregnancy_earlier, pregnancy_later, api_put
):
    create_patient()
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
    start_date = pregnancy_earlier["endDate"] - approx_1_month
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"pregnancyStartDate": start_date},
    )

    pregnancy = crud.read(Pregnancy, id=pregnancy_id)

    assert response.status_code == 409
    assert pregnancy.startDate == pregnancy_later["startDate"]

    pregnancy_id = pregnancy_earlier["id"]
    end_date = pregnancy_later["startDate"] + approx_1_month
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json={"pregnancyEndDate": end_date},
    )

    pregnancy = crud.read(Pregnancy, id=pregnancy_id)

    assert response.status_code == 409
    assert pregnancy.endDate == pregnancy_earlier["endDate"]


def test_invalid_pregnancy_not_created(
    create_patient, pregnancy_factory, patient_id, pregnancy_earlier, api_post
):
    create_patient()
    pregnancy_factory.create(**pregnancy_earlier)
    unit = pregnancy_earlier["defaultTimeUnit"]

    start_date = pregnancy_earlier["endDate"] + approx_1_month
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

    start_date = pregnancy_earlier["endDate"] - approx_1_month
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

    end_date = pregnancy_earlier["startDate"] + approx_1_month
    start_date = end_date - approx_8_months
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
