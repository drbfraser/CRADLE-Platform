import pytest
from humps import decamelize

import data.db_operations as crud
from models import FormClassificationOrmV2, FormTemplateOrmV2, LangVersionOrmV2


def test_create_form_classification_v2(
    database,
    fc_payload_1,
    fc_payload_2,
    api_post,
    api_get,
):
    created_ids = []
    created_lang_versions = []

    try:
        # initial count
        resp = api_get(endpoint="/api/forms/v2/classifications")
        existing = len(resp.json().get("classifications", []))

        # create first
        resp = api_post(endpoint="/api/forms/v2/classifications", json=fc_payload_1)
        database.session.commit()
        assert resp.status_code == 201
        created_ids.append(resp.json()["id"])
        created_lang_versions.append(resp.json()["nameStringId"])

        # create second
        resp = api_post(endpoint="/api/forms/v2/classifications", json=fc_payload_2)
        database.session.commit()
        assert resp.status_code == 201
        created_ids.append(resp.json()["id"])
        created_lang_versions.append(resp.json()["nameStringId"])

        # final count
        resp = api_get(endpoint="/api/forms/v2/classifications")
        body = decamelize(resp.json())
        assert resp.status_code == 200
        assert len(body["classifications"]) == existing + 2

    finally:
        for cid in created_ids:
            crud.delete_all(FormClassificationOrmV2, id=cid)
        for lvid in created_lang_versions:
            crud.delete_all(LangVersionOrmV2, string_id=lvid)


def test_update_form_classification_v2(
    database,
    fc_payload_1,
    fc_payload_2,
    api_post,
    api_get,
    api_put,
):
    created_id = None
    created_lang_version = None

    try:
        # create initial
        resp = api_post(
            endpoint="/api/forms/v2/classifications",
            json=fc_payload_1,
        )
        database.session.commit()
        assert resp.status_code == 201
        created_id = resp.json()["id"]
        created_lang_version = resp.json()["nameStringId"]

        # update
        update_payload = {
            "id": created_id,
            "name": fc_payload_2["name"],
            "name_string_id": created_lang_version,
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
        if created_lang_version:
            crud.delete_all(LangVersionOrmV2, string_id=created_lang_version)


def test_form_classification_summary_v2(
    database,
    template_payload_1,
    template_payload_2,
    template_payload_3,
    api_post,
    api_get,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []

    try:
        resp = api_get("/api/forms/v2/classifications/summary")
        existing = len(resp.json() or [])

        # create template -> backend auto-creates classification + lang versions
        r1 = api_post("/api/forms/v2/templates/body", json=template_payload_1)
        assert r1.status_code == 201
        t1 = r1.json()

        database.session.flush()
        database.session.commit()

        created_template_ids.append(t1["id"])
        created_classification_ids.append(t1["formClassificationId"])
        classification = crud.read(
            FormClassificationOrmV2, id=t1["formClassificationId"]
        )
        created_lang_versions.append(classification.name_string_id)

        # create template 2 (same classification) -> new version
        # backend archives previous template and creates v2
        template_payload_2["id"] = t1[
            "id"
        ]  # simulate editing existing template (upgrade version)
        template_payload_2["classification"]["id"] = t1["formClassificationId"]
        template_payload_2["classification"]["nameStringId"] = (
            classification.name_string_id
        )

        r2 = api_post("/api/forms/v2/templates/body", json=template_payload_2)
        assert r2.status_code == 201
        t2 = r2.json()

        created_template_ids.append(t2["id"])

        # create template 3 (different classification)
        r3 = api_post("/api/forms/v2/templates/body", json=template_payload_3)
        assert r3.status_code == 201
        t3 = r3.json()

        database.session.flush()
        database.session.commit()

        created_template_ids.append(t3["id"])
        created_classification_ids.append(t3["formClassificationId"])
        classification = crud.read(
            FormClassificationOrmV2, id=t3["formClassificationId"]
        )
        created_lang_versions.append(classification.name_string_id)

        # summary validation
        summary = api_get("/api/forms/v2/classifications/summary")
        assert summary.status_code == 200

        body = summary.json()
        assert len(body) == existing + 2

        # Classification One should have latest -> t2
        c1 = next(
            x
            for x in body
            if x["classification"]["name"]["english"] == "Classification One"
        )
        assert c1["id"] == t2["id"]

        # Classification Two should have its only template -> t3
        c2 = next(
            x
            for x in body
            if x["classification"]["name"]["english"] == "Classification Two"
        )
        assert c2["id"] == t3["id"]

    finally:
        for tid in created_template_ids:
            crud.delete_all(FormTemplateOrmV2, id=tid)

        for cid in created_classification_ids:
            crud.delete_all(FormClassificationOrmV2, id=cid)

        for lvid in created_lang_versions:
            crud.delete_all(LangVersionOrmV2, string_id=lvid)


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
