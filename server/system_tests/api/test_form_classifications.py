import time

import pytest
from humps import decamelize

import data.db_operations as crud
from common.print_utils import pretty_print
from models import FormClassificationOrm, FormTemplateOrm


def test_form_classification_created(
    database,
    form_classification_1,
    form_classification_2,
    api_post,
    api_get,
):
    try:
        response = api_get(endpoint="/api/forms/classifications")
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
        existing = len(response_body)

        response = api_post(
            endpoint="/api/forms/classifications",
            json=form_classification_1,
        )
        database.session.commit()

        assert response.status_code == 201

        response = api_post(
            endpoint="/api/forms/classifications",
            json=form_classification_2,
        )
        database.session.commit()
        assert response.status_code == 201

        response = api_get(endpoint="/api/forms/classifications")
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
        assert len(response_body) == existing + 2
    finally:
        crud.delete_all(FormClassificationOrm, name="fc1")
        crud.delete_all(FormClassificationOrm, name="fc2")


def test_form_classification_updated(
    database,
    form_classification_1,
    form_classification_2,
    api_post,
    api_get,
    api_put,
):
    try:
        response = api_post(
            endpoint="/api/forms/classifications",
            json=form_classification_1,
        )
        database.session.commit()
        assert response.status_code == 201

        response = api_get(endpoint="/api/forms/classifications")
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
        for classification in response_body:
            if classification["name"] == form_classification_1["name"]:
                id = classification["id"]
        assert id is not None

        response = api_put(
            endpoint=f"/api/forms/classifications/{id}",
            json={
                "id": id,
                "name": form_classification_2["name"],
            },
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        response = api_get(endpoint=f"/api/forms/classifications/{id}")
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
        assert response_body["name"] == form_classification_2["name"]
    finally:
        crud.delete_all(FormClassificationOrm, name="fc1")
        crud.delete_all(FormClassificationOrm, name="fc2")


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
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
        existing = len(response_body)

        response = api_post(
            endpoint="/api/forms/classifications",
            json=form_classification_1,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201 or response.status_code == 409

        response = api_post(
            endpoint="/api/forms/classifications",
            json=form_classification_2,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201 or response.status_code == 409

        crud.delete_all(FormTemplateOrm, id="ft1")
        response = api_post(endpoint="/api/forms/templates/body", json=form_template_1)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        time.sleep(1)

        crud.delete_all(FormTemplateOrm, id="ft2")
        response = api_post(endpoint="/api/forms/templates/body", json=form_template_2)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        time.sleep(1)

        crud.delete_all(FormTemplateOrm, id="ft3")
        response = api_post(endpoint="/api/forms/templates/body", json=form_template_3)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        response = api_get(endpoint="/api/forms/classifications/summary")
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
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
        crud.delete_all(FormClassificationOrm, name="fc1")
        crud.delete_all(FormClassificationOrm, name="fc2")
        crud.delete_all(FormTemplateOrm, id="ft1")
        crud.delete_all(FormTemplateOrm, id="ft2")
        crud.delete_all(FormTemplateOrm, id="ft3")


@pytest.fixture
def form_classification_1():
    return {
        "id": "fc1",
        "name": "fc1",
    }


@pytest.fixture
def form_template_1():
    return {
        "classification": {
            "id": "fc1",
            "name": "fc1",
        },
        "id": "ft1",
        "version": "V1",
        "questions": [],
    }


@pytest.fixture
def form_classification_2():
    return {
        "id": "fc2",
        "name": "fc2",
    }


@pytest.fixture
def form_template_2():
    return {
        "classification": {
            "id": "fc2",
            "name": "fc2",
        },
        "id": "ft2",
        "version": "V1",
        "questions": [],
    }


@pytest.fixture
def form_template_3():
    return {
        "classification": {
            "id": "fc2",
            "name": "fc2",
        },
        "id": "ft3",
        "version": "V2",
        "questions": [],
    }
