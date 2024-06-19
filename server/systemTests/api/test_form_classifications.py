import pytest
import time
import data.crud as crud
from models import FormTemplate, FormClassification


def test_form_classification_created(
    database, form_classification_1, form_classification_2, api_post, api_get
):
    try:
        response = api_get(endpoint="/api/forms/classifications")
        assert response.status_code == 200
        response_body = response.json()
        existing = len(response_body)

        response = api_post(
            endpoint="/api/forms/classifications", json=form_classification_1
        )
        database.session.commit()
        assert response.status_code == 201

        response = api_post(
            endpoint="/api/forms/classifications", json=form_classification_2
        )
        database.session.commit()
        assert response.status_code == 201

        response = api_get(endpoint="/api/forms/classifications")
        assert response.status_code == 200
        response_body = response.json()
        assert len(response_body) == existing + 2
    finally:
        crud.delete_all(FormClassification, name="fc1")
        crud.delete_all(FormClassification, name="fc2")


def test_form_classification_updated(
    database, form_classification_1, form_classification_2, api_post, api_get, api_put
):
    try:
        response = api_post(
            endpoint="/api/forms/classifications", json=form_classification_1
        )
        database.session.commit()
        assert response.status_code == 201

        response = api_get(endpoint="/api/forms/classifications")
        assert response.status_code == 200
        response_body = response.json()
        for classification in response_body:
            if classification["name"] == form_classification_1["name"]:
                id = classification["id"]
        assert id != None

        response = api_put(
            endpoint=f"/api/forms/classifications/{id}", json=form_classification_2
        )
        database.session.commit()
        assert response.status_code == 201

        response = api_get(endpoint=f"/api/forms/classifications/{id}")
        assert response.status_code == 200
        response_body = response.json()
        assert response_body["name"] == form_classification_2["name"]
    finally:
        crud.delete_all(FormClassification, name="fc1")
        crud.delete_all(FormClassification, name="fc2")


def test_form_classification_summary(
    database,
    form_classification_1,
    form_classification_2,
    form_template_1,
    form_template_2,
    form_template_3,
    api_post,
    api_get,
):
    try:
        response = api_get(endpoint="/api/forms/classifications/summary")
        assert response.status_code == 200
        response_body = response.json()
        existing = len(response_body)

        response = api_post(
            endpoint="/api/forms/classifications", json=form_classification_1
        )
        database.session.commit()
        assert response.status_code == 201 or response.status_code == 409

        response = api_post(
            endpoint="/api/forms/classifications", json=form_classification_2
        )
        database.session.commit()
        assert response.status_code == 201 or response.status_code == 409

        crud.delete_all(FormTemplate, id="ft1")
        response = api_post(endpoint="/api/forms/templates", json=form_template_1)
        database.session.commit()
        assert response.status_code == 201

        time.sleep(1)

        crud.delete_all(FormTemplate, id="ft2")
        response = api_post(endpoint="/api/forms/templates", json=form_template_2)
        database.session.commit()
        assert response.status_code == 201

        time.sleep(1)

        crud.delete_all(FormTemplate, id="ft3")
        response = api_post(endpoint="/api/forms/templates", json=form_template_3)
        database.session.commit()
        assert response.status_code == 201

        response = api_get(endpoint="/api/forms/classifications/summary")
        assert response.status_code == 200
        response_body = response.json()
        assert len(response_body) == existing + 2

        filtered = [
            x
            for x in response_body
            if x["classification"]["name"] == form_classification_1["name"]
        ]
        assert len(filtered) == 1
        assert filtered[0]["id"] == "ft1"

        filtered = [
            x
            for x in response_body
            if x["classification"]["name"] == form_classification_2["name"]
        ]
        assert len(filtered) == 1
        assert filtered[0]["id"] == "ft3"

    finally:
        crud.delete_all(FormClassification, name="fc1")
        crud.delete_all(FormClassification, name="fc2")
        crud.delete_all(FormTemplate, id="ft1")
        crud.delete_all(FormTemplate, id="ft2")
        crud.delete_all(FormTemplate, id="ft3")


@pytest.fixture
def form_classification_1():
    return {"name": "fc1"}


@pytest.fixture
def form_template_1():
    return {
        "classification": {"name": "fc1"},
        "id": "ft1",
        "version": "V1",
        "questions": [],
    }


@pytest.fixture
def form_classification_2():
    return {"name": "fc2"}


@pytest.fixture
def form_template_2():
    return {
        "classification": {"name": "fc2"},
        "id": "ft2",
        "version": "V1",
        "questions": [],
    }


@pytest.fixture
def form_template_3():
    return {
        "classification": {"name": "fc2"},
        "id": "ft3",
        "version": "V2",
        "questions": [],
    }
