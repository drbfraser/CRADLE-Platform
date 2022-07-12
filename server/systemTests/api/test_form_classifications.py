import pytest

import data.crud as crud
from models import FormClassification


def test_form_classification_created(database, form_classification_1, form_classification_2, api_post, api_get):
    try:
        response = api_get(endpoint="/api/forms/classifications")
        assert response.status_code == 200
        response_body = response.json()
        existing = len(response_body)
        
        response = api_post(endpoint="/api/forms/classifications", json=form_classification_1)
        database.session.commit()
        assert response.status_code == 201
        
        response = api_post(endpoint="/api/forms/classifications", json=form_classification_2)
        database.session.commit()
        assert response.status_code == 201
        
        response = api_get(endpoint="/api/forms/classifications")
        assert response.status_code == 200
        response_body = response.json()
        assert len(response_body) == existing + 2
    finally:
        crud.delete_by(FormClassification, name="fc1")
        crud.delete_by(FormClassification, name="fc2")


@pytest.fixture
def form_classification_1():
    return {"name": "fc1"}


@pytest.fixture
def form_classification_2():
    return {"name": "fc2"}

