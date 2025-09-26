import pytest
from humps import decamelize

from common.print_utils import pretty_print
import data.db_operations as crud
from models import ReadingOrm


def test_invalid_reading_not_created(
    patient_id,
    reading_id,
    reading,
    patient_factory,
    api_post,
):
    patient_factory.create(id=patient_id)
    # Removed systolic_blood_pressure to make the reading invalid
    del reading["systolic_blood_pressure"]

    response = api_post(endpoint="/api/readings", json=reading)
    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 422
    assert crud.read(ReadingOrm, id=reading_id) is None


@pytest.fixture
def reading_id():
    return "9771e6ee-81af-41a4-afff-9676cadcc00a"
