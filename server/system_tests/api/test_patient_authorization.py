import pytest

import data.db_operations as crud
from data import orm_serializer
from models import PregnancyOrm

UNAUTHORIZED_PREGNANCY_ID = 602000001


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_associated_vht_can_access_patient(api_get):
    response = api_get(endpoint="/api/patients/49300028162/info")

    assert response.status_code == 200


@pytest.mark.parametrize(
    "credentials",
    [
        ("hcw@email.com", "cradle-hcw"),
        ("cho@email.com", "cradle-cho"),
    ],
    ids=["hcw", "cho"],
)
def test_hcw_and_cho_can_access_unassociated_patient(api_get):
    response = api_get(endpoint="/api/patients/49300028161/info")

    assert response.status_code == 200


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
@pytest.mark.parametrize(
    "endpoint",
    [
        "/api/patients/49300028161/info",
        "/api/patients/49300028161/pregnancies",
        "/api/patients/49300028161/medical_records",
    ],
    ids=["patient", "pregnancy", "medical-record"],
)
def test_unassociated_vht_cannot_access_direct_patient_routes(api_get, endpoint):
    response = api_get(endpoint=endpoint)

    assert response.status_code == 403


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
@pytest.mark.parametrize(
    "method, suffix",
    [
        ("PUT", "info"),
        ("GET", "readings"),
        ("GET", "most_recent_reading"),
        ("GET", "referrals"),
        ("GET", "forms"),
        ("GET", "get_all_records"),
    ],
    ids=[
        "update-info",
        "readings",
        "most-recent-reading",
        "referrals",
        "forms",
        "all-records",
    ],
)
def test_unassociated_vht_cannot_access_patient_data(
    patient_factory, patient_info, api_get, api_put, method, suffix
):
    patient = patient_factory.create(**patient_info, last_edited=5)
    crud.db_session.refresh(patient)
    original_patient = orm_serializer.marshal(patient, shallow=True)
    endpoint = f"/api/patients/{patient.id}/{suffix}"

    if method == "PUT":
        response = api_put(
            endpoint=endpoint,
            json={**patient_info, "name": "Unauthorized change"},
        )
    else:
        response = api_get(endpoint=endpoint)

    assert response.status_code == 403
    if method == "PUT":
        crud.db_session.refresh(patient)
        assert orm_serializer.marshal(patient, shallow=True) == original_patient


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_vht_patient_list_matches_direct_access(api_get):
    response = api_get(endpoint="/api/patients?search=4930002816")

    assert response.status_code == 200
    patient_ids = {patient["id"] for patient in response.json()}
    assert "49300028162" in patient_ids
    assert "49300028161" not in patient_ids


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_unassociated_vht_cannot_create_pregnancy(api_post):
    try:
        response = api_post(
            endpoint="/api/patients/49300028161/pregnancies",
            json={
                "id": UNAUTHORIZED_PREGNANCY_ID,
                "patient_id": "49300028161",
                "start_date": 1500000000,
            },
        )

        assert response.status_code == 403
        assert crud.read(PregnancyOrm, id=UNAUTHORIZED_PREGNANCY_ID) is None
    finally:
        crud.delete_by(PregnancyOrm, id=UNAUTHORIZED_PREGNANCY_ID)
