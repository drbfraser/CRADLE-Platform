import datetime

from humps import decamelize

from data import crud
from models import PregnancyOrm

approx_8_months = int(datetime.timedelta(days=8 * 30).total_seconds())
approx_1_month = int(datetime.timedelta(days=30).total_seconds())


def test_get_pregnancy(create_patient, pregnancy_factory, pregnancy_earlier, api_get):
    create_patient()
    pregnancy_factory.create(**pregnancy_earlier)

    pregnancy_id = pregnancy_earlier["id"]
    response = api_get(endpoint=f"/api/pregnancies/{pregnancy_id}")

    print(response.json())
    assert response.status_code == 200

    expected = {
        "id": pregnancy_id,
        "patient_id": pregnancy_earlier["patient_id"],
        "start_date": pregnancy_earlier["start_date"],
        "end_date": pregnancy_earlier["end_date"],
        "outcome": pregnancy_earlier["outcome"],
    }

    response_body = decamelize(response.json())
    del response_body["last_edited"]
    assert response_body == expected


def test_put_pregnancy(
    create_patient, pregnancy_factory, pregnancy_later, api_put, api_get
):
    create_patient()
    pregnancy_factory.create(**pregnancy_later)
    pregnancy_id = pregnancy_later["id"]

    response = api_get(f"/api/pregnancies/{pregnancy_id}")
    pregnancy = decamelize(response.json())

    pregnancy["end_date"] = pregnancy_later["start_date"] + approx_8_months
    pregnancy["outcome"] = "Baby born at 8 months."
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json=pregnancy,
    )

    response_body = decamelize(response.json())
    print(response_body)

    new_pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)

    assert response.status_code == 200
    assert new_pregnancy is not None
    assert new_pregnancy.end_date == pregnancy["end_date"]
    assert new_pregnancy.outcome == pregnancy["outcome"]


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
        "patient_id": patient_id,
        "start_date": pregnancy_later["start_date"],
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    new_pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)

    response_body = decamelize(response.json())
    print(response_body)

    assert response.status_code == 201
    assert new_pregnancy is not None
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

    response_body = decamelize(response.json())
    print(response_body)

    assert response.status_code == 200
    assert len(response_body) >= 2


def test_invalid_pregnancy_not_updated(
    create_patient,
    pregnancy_factory,
    pregnancy_earlier,
    pregnancy_later,
    api_put,
    api_get,
):
    create_patient()
    pregnancy_factory.create(**pregnancy_earlier)
    pregnancy_id = pregnancy_earlier["id"]

    response = api_get(endpoint=f"/api/pregnancies/{pregnancy_id}")
    pregnancy = decamelize(response.json())

    # Trying to change patient_id should fail with a 400 status code.
    pregnancy["patient_id"] = "0"

    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json=pregnancy,
    )

    response_body = decamelize(response.json())
    print(response_body)

    pregnancy = crud.read(PregnancyOrm, id=pregnancy_id)

    assert response.status_code == 400
    assert pregnancy is not None
    assert pregnancy.patient_id == pregnancy_earlier["patient_id"]

    pregnancy_factory.create(**pregnancy_later)
    pregnancy_id = pregnancy_later["id"]
    response = api_get(endpoint=f"/api/pregnancies/{pregnancy_id}")
    pregnancy = decamelize(response.json())

    # Conflict with existing pregnancy, should return 409.
    pregnancy["start_date"] = pregnancy_earlier["end_date"] - approx_1_month
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json=pregnancy,
    )

    pregnancy_orm = crud.read(PregnancyOrm, id=pregnancy_id)

    response_body = decamelize(response.json())
    print(response_body)

    assert response.status_code == 409
    assert pregnancy_orm is not None
    assert pregnancy_orm.start_date == pregnancy_later["start_date"]

    pregnancy_id = pregnancy_earlier["id"]
    response = api_get(endpoint=f"/api/pregnancies/{pregnancy_id}")
    pregnancy = decamelize(response.json())

    # Conflict with existing pregnancy, should return 409.
    pregnancy["end_date"] = pregnancy_later["start_date"] + approx_1_month
    response = api_put(
        endpoint=f"/api/pregnancies/{pregnancy_id}",
        json=pregnancy,
    )

    response_body = decamelize(response.json())
    print(response_body)

    pregnancy_orm = crud.read(PregnancyOrm, id=pregnancy_id)

    assert response.status_code == 409
    assert pregnancy_orm is not None
    assert pregnancy_orm.end_date == pregnancy_earlier["end_date"]


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
        "patient_id": patient_id,
        "start_date": start_date,
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    response_body = decamelize(response.json())
    print(response_body)

    assert response.status_code == 409
    assert crud.read(PregnancyOrm, patient_id=patient_id, start_date=start_date) is None

    start_date = pregnancy_earlier["end_date"] - approx_1_month
    pregnancy = {
        "patient_id": patient_id,
        "start_date": start_date,
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    response_body = decamelize(response.json())
    print(response_body)

    assert response.status_code == 409
    assert crud.read(PregnancyOrm, patient_id=patient_id, start_date=start_date) is None

    end_date = pregnancy_earlier["start_date"] + approx_1_month
    start_date = end_date - approx_8_months
    pregnancy = {
        "patient_id": patient_id,
        "start_date": start_date,
        "end_date": end_date,
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/pregnancies",
        json=pregnancy,
    )

    response_body = decamelize(response.json())
    print(response_body)

    assert response.status_code == 409
    assert crud.read(PregnancyOrm, patient_id=patient_id, start_date=start_date) is None
