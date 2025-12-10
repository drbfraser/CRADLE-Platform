import time

import pytest
from humps import decamelize

import data.db_operations as crud
from models import FormClassificationOrmV2, FormTemplateOrmV2


def test_create_form_classification_v2(
    database,
    fc_payload_1,
    fc_payload_2,
    api_post,
    api_get,
):
    created_ids = []

    try:
        # initial count
        resp = api_get(endpoint="/api/forms/v2/classifications")
        existing = len(resp.json().get("classifications", []))

        # create first
        resp = api_post(endpoint="/api/forms/v2/classifications", json=fc_payload_1)
        database.session.commit()
        assert resp.status_code == 201
        created_ids.append(resp.json()["id"])

        # create second
        resp = api_post(endpoint="/api/forms/v2/classifications", json=fc_payload_2)
        database.session.commit()
        assert resp.status_code == 201
        created_ids.append(resp.json()["id"])

        # final count
        resp = api_get(endpoint="/api/forms/v2/classifications")
        body = decamelize(resp.json())
        assert resp.status_code == 200
        assert len(body["classifications"]) == existing + 2

    finally:
        for cid in created_ids:
            crud.delete_all(FormClassificationOrmV2, id=cid)


def test_update_form_classification_v2(
    database,
    fc_payload_1,
    fc_payload_2,
    api_post,
    api_get,
    api_put,
):
    created_id = None

    try:
        # create initial
        resp = api_post(
            endpoint="/api/forms/v2/classifications",
            json=fc_payload_1,
        )
        database.session.commit()
        assert resp.status_code == 201
        created_id = resp.json()["id"]

        # update
        update_payload = {
            "id": created_id,
            "name": fc_payload_2["name"],
        }

        resp = api_put(
            endpoint=f"/api/forms/v2/classifications/{created_id}",
            json=update_payload,
        )
        database.session.commit()
        assert resp.status_code == 200

        # verify
        resp = api_get(endpoint=f"/api/forms/v2/classifications/{created_id}")
        assert resp.status_code == 200
        assert resp.json()["name"] == fc_payload_2["name"]

    finally:
        if created_id:
            crud.delete_all(FormClassificationOrmV2, id=created_id)


def test_form_classification_summary_v2(
    database,
    fc_payload_1,
    fc_payload_2,
    template_payload_1,
    template_payload_2,
    template_payload_3,
    api_post,
    api_get,
):
    created_fc_ids = []
    created_template_ids = []

    try:
        # initial summary size
        resp = api_get(endpoint="/api/forms/v2/classifications/summary")
        existing = len(resp.json() or [])

        # create classifications
        for payload in (fc_payload_1, fc_payload_2):
            r = api_post("/api/forms/v2/classifications", json=payload)
            database.session.commit()
            if r.status_code == 201:
                created_fc_ids.append(r.json()["id"])

        # create templates
        for tpl in (template_payload_1, template_payload_2, template_payload_3):
            r = api_post("/api/forms/v2/templates/body", json=tpl)
            database.session.commit()
            assert r.status_code == 201
            created_template_ids.append(tpl["id"])
            time.sleep(0.8)

        resp = api_get("/api/forms/v2/classifications/summary")
        body = decamelize(resp.json())

        assert resp.status_code == 200
        assert len(body) == existing + 2

        # validation checks
        f1 = next(
            x
            for x in body
            if x["classification"]["name"]["english"] == fc_payload_1["name"]["English"]
        )
        assert f1["id"] == "ft1"

        f2 = next(
            x
            for x in body
            if x["classification"]["name"]["english"] == fc_payload_2["name"]["English"]
        )
        assert f2["id"] == "ft3"

    finally:
        for tid in created_template_ids:
            crud.delete_all(FormTemplateOrmV2, id=tid)
        for cid in created_fc_ids:
            crud.delete_all(FormClassificationOrmV2, id=cid)


@pytest.fixture
def fc_payload_1():
    return {
        "name": {
            "English": "Classification One",
        }
    }


@pytest.fixture
def fc_payload_2():
    return {
        "name": {
            "English": "Classification Two",
        }
    }


@pytest.fixture
def template_payload_1():
    return {
        "id": "ft1",
        "classification_id": None,
        "version": 1,
        "questions": [],
    }


@pytest.fixture
def template_payload_2():
    return {
        "id": "ft2",
        "classification_id": None,
        "version": 1,
        "questions": [],
    }


@pytest.fixture
def template_payload_3():
    return {
        "id": "ft3",
        "classification_id": None,
        "version": 2,
        "questions": [],
    }
