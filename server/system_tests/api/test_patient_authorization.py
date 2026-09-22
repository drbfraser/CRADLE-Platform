import pytest

import data.db_operations as crud
from models import PregnancyOrm

UNAUTHORIZED_PREGNANCY_ID = 602000001


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_associated_vht_can_access_patient(api_get):
    response = api_get(endpoint="/api/patients/49300028162/info")

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
