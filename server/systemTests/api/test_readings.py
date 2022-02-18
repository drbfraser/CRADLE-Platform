import pytest

import data.crud as crud
from models import Reading


def test_invalid_reading_not_created(
    patient_id, reading_id, reading, patient_factory, api_post
):
    patient_factory.create(patientId=patient_id)
    # Removed bpSystolic to make the reading invalid
    del reading["bpSystolic"]

    response = api_post(endpoint="/api/readings", json=reading)
    assert response.status_code == 400
    assert crud.read(Reading, readingId=reading_id) is None


@pytest.fixture
def reading_id():
    return "9771e6ee-81af-41a4-afff-9676cadcc00a"
