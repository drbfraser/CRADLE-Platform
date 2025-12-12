import logging

from humps import decamelize

import data.db_operations as crud
from models import (
    FormClassificationOrmV2,
    FormQuestionTemplateOrmV2,
    FormTemplateOrmV2,
    LangVersionOrmV2,
)

logger = logging.getLogger(__name__)


def test_create_form_template_v2(database, form_template_v2_payload, api_post):
    created_classification_ids = []
    created_template_ids = []
    created_lang_versions = []

    try:
        # Create template
        r = api_post("/api/forms/v2/templates/body", json=form_template_v2_payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        body = decamelize(r.json())
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])

        # Verify template exists in DB
        template = crud.read(FormTemplateOrmV2, id=body["id"])
        assert template is not None
        assert template.version == form_template_v2_payload["version"]

        classification = crud.read(
            FormClassificationOrmV2, id=body["form_classification_id"]
        )
        template = crud.read(FormTemplateOrmV2, id=body["id"])

        created_lang_versions.append(classification.name_string_id)
        for ques in template.questions:
            created_lang_versions.append(ques.question_string_id)

    finally:
        for tid in created_template_ids:
            crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=tid)
            crud.delete_all(FormTemplateOrmV2, id=tid)

        for cid in created_classification_ids:
            crud.delete_all(FormClassificationOrmV2, id=cid)

        for lvid in created_lang_versions:
            crud.delete_all(LangVersionOrmV2, string_id=lvid)


def test_form_template_duplicate_version_rejected(
    database, form_template_v2_payload, api_post
):
    created_classification_ids = []
    created_template_ids = []
    created_lang_versions = []

    try:
        # First create
        r1 = api_post("/api/forms/v2/templates/body", json=form_template_v2_payload)
        assert r1.status_code == 201

        database.session.flush()
        database.session.commit()

        body = decamelize(r1.json())
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])

        classification = crud.read(
            FormClassificationOrmV2, id=body["form_classification_id"]
        )
        template = crud.read(FormTemplateOrmV2, id=body["id"])

        created_lang_versions.append(classification.name_string_id)
        for ques in template.questions:
            created_lang_versions.append(ques.question_string_id)

        # Try creating same version again
        r2 = api_post("/api/forms/v2/templates/body", json=form_template_v2_payload)
        assert r2.status_code == 409

    finally:
        for tid in created_template_ids:
            crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=tid)
            crud.delete_all(FormTemplateOrmV2, id=tid)

        for cid in created_classification_ids:
            crud.delete_all(FormClassificationOrmV2, id=cid)

        for lvid in created_lang_versions:
            crud.delete_all(LangVersionOrmV2, string_id=lvid)


def test_archive_form_template_v2(
    database, form_template_v2_payload, api_post, api_put
):
    created_classification_ids = []
    created_template_ids = []
    created_lang_versions = []

    try:
        # Create template
        r1 = api_post("/api/forms/v2/templates/body", json=form_template_v2_payload)
        assert r1.status_code == 201

        database.session.flush()
        database.session.commit()

        body = decamelize(r1.json())
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])

        classification = crud.read(
            FormClassificationOrmV2, id=body["form_classification_id"]
        )
        template = crud.read(FormTemplateOrmV2, id=body["id"])

        created_lang_versions.append(classification.name_string_id)
        for ques in template.questions:
            created_lang_versions.append(ques.question_string_id)

        # Archive it
        r2 = api_put(f"/api/forms/v2/templates/{body['id']}", json={"archived": True})
        assert r2.status_code == 201
        database.session.commit()

        # Verify DB
        template = crud.read(FormTemplateOrmV2, id=body["id"])
        assert template.archived is True

    finally:
        for tid in created_template_ids:
            crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=tid)
            crud.delete_all(FormTemplateOrmV2, id=tid)

        for cid in created_classification_ids:
            crud.delete_all(FormClassificationOrmV2, id=cid)

        for lvid in created_lang_versions:
            crud.delete_all(LangVersionOrmV2, string_id=lvid)
