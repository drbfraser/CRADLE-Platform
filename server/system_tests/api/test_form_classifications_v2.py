import copy

import pytest
from humps import decamelize

from common.commonUtil import get_uuid


def test_get_classification_by_id(
    api_get, form_classification_v2_resources, fc_payload_1
):
    created = form_classification_v2_resources.create(fc_payload_1)

    response = api_get(endpoint=f"/api/forms/v2/classifications/{created['id']}")
    assert response.status_code == 200

    body = decamelize(response.json())
    assert body["id"] == created["id"]
    assert body["name"] == fc_payload_1["name"]


def test_get_classification_by_id_not_found(api_get):
    missing_id = get_uuid()
    response = api_get(endpoint=f"/api/forms/v2/classifications/{missing_id}")
    assert response.status_code == 404
    assert (
        response.json()["description"]
        == f"No Form Classification with id=({missing_id}) found."
    )


def test_get_classification_templates(
    api_get,
    form_v2_resources,
    template_payload_1,
    template_payload_2,
):
    t1_bundle = form_v2_resources.create_template_from_payload(template_payload_1)
    t1 = t1_bundle["body"]
    classification_id = t1["form_classification_id"]
    classification = t1_bundle["classification"]

    version_two_payload = copy.deepcopy(template_payload_2)
    version_two_payload["id"] = t1["id"]
    version_two_payload["classification"]["id"] = classification_id
    version_two_payload["classification"]["nameStringId"] = (
        classification.name_string_id
    )

    t2_bundle = form_v2_resources.create_template_from_payload(version_two_payload)
    t2 = t2_bundle["body"]

    response = api_get(
        endpoint=f"/api/forms/v2/classifications/{classification_id}/templates"
    )
    assert response.status_code == 200

    templates = response.json()
    template_ids = {template["id"] for template in templates}
    versions = {template["version"] for template in templates}

    assert template_ids == {t1["id"], t2["id"]}
    assert versions == {1, 2}
    for template in templates:
        assert template["classification"]["name"]["english"] == "Classification One"


def test_duplicate_classification_name(
    form_classification_v2_resources, fc_payload_1, api_post
):
    form_classification_v2_resources.create(fc_payload_1)

    response = api_post(endpoint="/api/forms/v2/classifications", json=fc_payload_1)
    assert response.status_code == 409
    assert (
        response.json()["description"]
        == "Form Classification with name=(Classification One) already exists."
    )


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_create_classification_requires_admin(api_post, fc_payload_1, credentials):
    response = api_post(endpoint="/api/forms/v2/classifications", json=fc_payload_1)
    assert response.status_code == 401
    assert (
        response.json()["message"] == "This user does not have the required privileges"
    )


@pytest.mark.parametrize("credentials", [("vht@email.com", "cradle-vht")])
def test_update_classification_requires_admin(
    database,
    api,
    api_put,
    fc_payload_1,
    fc_payload_2,
    form_classification_v2_resources,
    credentials,
):
    create_resp = api.post(
        "/api/forms/v2/classifications",
        fc_payload_1,
        email="admin@email.com",
        password="cradle-admin",
    )
    database.session.commit()
    assert create_resp.status_code == 201
    created = decamelize(create_resp.json())
    form_classification_v2_resources.state["classification_ids"].append(created["id"])
    form_classification_v2_resources.state["lang_ids"].append(created["name_string_id"])

    update_payload = {
        "id": created["id"],
        "name": fc_payload_2["name"],
        "name_string_id": created["name_string_id"],
    }

    response = api_put(
        endpoint=f"/api/forms/v2/classifications/{created['id']}",
        json=update_payload,
    )
    assert response.status_code == 401
    assert (
        response.json()["message"] == "This user does not have the required privileges"
    )


def test_create_form_classification_v2(
    api_get,
    form_classification_v2_resources,
    fc_payload_1,
    fc_payload_2,
):
    response = api_get(endpoint="/api/forms/v2/classifications")
    existing = len(response.json().get("classifications", []))

    form_classification_v2_resources.create(fc_payload_1)
    form_classification_v2_resources.create(fc_payload_2)

    response = api_get(endpoint="/api/forms/v2/classifications")
    body = decamelize(response.json())
    assert response.status_code == 200
    assert len(body["classifications"]) == existing + 2


def test_update_form_classification_v2(
    api_get,
    api_put,
    form_classification_v2_resources,
    fc_payload_1,
    fc_payload_2,
):
    created = form_classification_v2_resources.create(fc_payload_1)

    update_payload = {
        "id": created["id"],
        "name": fc_payload_2["name"],
        "name_string_id": created["name_string_id"],
    }

    response = api_put(
        endpoint=f"/api/forms/v2/classifications/{created['id']}",
        json=update_payload,
    )
    assert response.status_code == 200

    response = api_get(endpoint=f"/api/forms/v2/classifications/{created['id']}")
    assert response.status_code == 200
    assert response.json()["name"] == fc_payload_2["name"]


def test_form_classification_summary_v2(
    api_get,
    form_v2_resources,
    template_payload_1,
    template_payload_2,
    template_payload_3,
):
    response = api_get("/api/forms/v2/classifications/summary")
    existing = len(response.json() or [])

    t1_bundle = form_v2_resources.create_template_from_payload(template_payload_1)
    t1 = t1_bundle["body"]
    classification = t1_bundle["classification"]

    version_two_payload = copy.deepcopy(template_payload_2)
    version_two_payload["id"] = t1["id"]
    version_two_payload["classification"]["id"] = t1["form_classification_id"]
    version_two_payload["classification"]["nameStringId"] = (
        classification.name_string_id
    )

    t2_bundle = form_v2_resources.create_template_from_payload(version_two_payload)
    t2 = t2_bundle["body"]

    t3_bundle = form_v2_resources.create_template_from_payload(template_payload_3)
    t3 = t3_bundle["body"]

    summary = api_get("/api/forms/v2/classifications/summary")
    assert summary.status_code == 200

    body = summary.json()
    assert len(body) == existing + 2

    classification_one = next(
        entry
        for entry in body
        if entry["classification"]["name"]["english"] == "Classification One"
    )
    assert classification_one["id"] == t2["id"]

    classification_two = next(
        entry
        for entry in body
        if entry["classification"]["name"]["english"] == "Classification Two"
    )
    assert classification_two["id"] == t3["id"]


@pytest.fixture
def fc_payload_1():
    return {
        "name": {
            "english": "Classification One",
        }
    }


@pytest.fixture
def fc_payload_2():
    return {
        "name": {
            "english": "Classification Two",
        }
    }


@pytest.fixture
def template_payload_1():
    return {
        "id": None,
        "classification": {
            "id": None,
            "name": {"english": "Classification One"},
            "nameStringId": None,
        },
        "version": "1",
        "questions": [],
    }


@pytest.fixture
def template_payload_2():
    return {
        "id": None,
        "classification": {
            "id": None,
            "name": {"english": "Classification One"},
            "nameStringId": None,
        },
        "version": "2",
        "questions": [],
    }


@pytest.fixture
def template_payload_3():
    return {
        "id": None,
        "classification": {
            "id": None,
            "name": {"english": "Classification Two"},
            "nameStringId": None,
        },
        "version": "1",
        "questions": [],
    }
