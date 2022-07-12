import pytest

import data.crud as crud
from models import FormClassification


def test_form_classification_created(database, form_classification, api_post):
    try:
        response = api_post(endpoint="/api/forms/classifications", json=form_classification)
        database.session.commit()
        assert response.status_code == 201
    finally:
        crud.delete_by(FormClassification, name="fc1")


@pytest.fixture
def form_classification():
    return {"name": "fc1"}

