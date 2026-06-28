from humps import decamelize

import data.db_operations as crud
from common.commonUtil import get_uuid
from models import (
    FormClassificationOrmV2,
    FormQuestionTemplateOrmV2,
    FormTemplateOrmV2,
    LangVersionOrmV2,
)


def test_create_form_template_v2(database, form_template_v2_payload, api_post):
    created_classification_ids = []
    created_template_ids = []
    created_lang_versions = []

    try:
        # Create template
        payload = form_template_v2_payload()
        r = api_post("/api/forms/v2/templates/body", json=payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        body = decamelize(r.json())
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])

        # Verify template exists in DB
        template = crud.read(FormTemplateOrmV2, id=body["id"])
        assert template is not None
        assert template.version == payload["version"]

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
        payload = form_template_v2_payload()
        r1 = api_post("/api/forms/v2/templates/body", json=payload)
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
        r2 = api_post("/api/forms/v2/templates/body", json=payload)
        assert r2.status_code == 409

    finally:
        for tid in created_template_ids:
            crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=tid)
            crud.delete_all(FormTemplateOrmV2, id=tid)

        for cid in created_classification_ids:
            crud.delete_all(FormClassificationOrmV2, id=cid)

        for lvid in created_lang_versions:
            crud.delete_all(LangVersionOrmV2, string_id=lvid)


def test_form_template_graceful_failure(database, form_template_v2_payload, api_post):
    classification_id = "rollback_test_classification"

    payload = form_template_v2_payload(
        overrides={
            "classification": {
                "id": classification_id,
                "name": {"english": "Rollback Test Form"},
            }
        },
        extra_questions=[
            {
                "question_type": "INTEGER",
                "order": 2,
                "required": True,
                "question_text": {"english": "Duplicate heart rate"},
                "num_min": 0,
                "num_max": 300,
                "category_index": 0,
                "user_question_id": "heart_rate",
                "mc_options": [],
            }
        ],
    )

    try:
        response = api_post("/api/forms/v2/templates/body", json=payload)

        assert response.status_code != 201

        assert crud.read(FormClassificationOrmV2, id=classification_id) is None

    finally:
        crud.delete_all(FormClassificationOrmV2, id=classification_id)


def test_archive_form_template_v2(
    database, form_template_v2_payload, api_post, api_put
):
    created_classification_ids = []
    created_template_ids = []
    created_lang_versions = []

    try:
        # Create template
        payload = form_template_v2_payload()
        r1 = api_post("/api/forms/v2/templates/body", json=payload)
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


def test_form_version_update_archives_previous_and_creates_new(
    database, api_post, form_template_v2_payload
):
    """
    Submitting a new form version (same classification, incremented version number) must:
    - produce a new row with a different UUID (not an in-place edit)
    - keep the same classification
    - archive the previous active version
    - leave exactly one active form under the classification
    """
    form_v1_id = None
    form_v2_id = None
    form_classification_id = None
    lang_ids = []

    try:
        form_name = f"Version Test Form {get_uuid()}"

        # create v1
        v1_payload = form_template_v2_payload(
            overrides={"classification": {"name": {"english": form_name}}}
        )
        r1 = api_post("/api/forms/v2/templates/body", json=v1_payload)
        database.session.commit()
        assert r1.status_code == 201
        v1_body = decamelize(r1.json())
        form_v1_id = v1_body["id"]
        form_classification_id = v1_body["form_classification_id"]

        classification = crud.read(FormClassificationOrmV2, id=form_classification_id)
        form_v1_orm = crud.read(FormTemplateOrmV2, id=form_v1_id)
        lang_ids.append(classification.name_string_id)
        for q in form_v1_orm.questions:
            lang_ids.append(q.question_string_id)

        # submit v2 with bumped up version
        v2_payload = form_template_v2_payload(
            overrides={
                "id": form_v1_id,
                "version": 2,
                "classification": {
                    "id": form_classification_id,
                    "name": {"english": form_name},
                },
            }
        )
        r2 = api_post("/api/forms/v2/templates/body", json=v2_payload)
        database.session.commit()
        assert r2.status_code == 201
        v2_body = decamelize(r2.json())
        form_v2_id = v2_body["id"]

        form_v2_orm = crud.read(FormTemplateOrmV2, id=form_v2_id)
        for q in form_v2_orm.questions:
            lang_ids.append(q.question_string_id)

        # a new row must have been created, not an in-place edit of V1
        assert form_v2_id != form_v1_id

        # both versions must belong to the same classification
        assert v2_body["form_classification_id"] == form_classification_id

        # V2 must carry the version number the user submitted
        assert form_v2_orm.version == 2

        # V2 must be the active version
        assert form_v2_orm.archived is False

        # V1 must now be archived
        form_v1_orm = crud.read(FormTemplateOrmV2, id=form_v1_id)
        assert form_v1_orm.archived is True

        # exactly one active form must exist under this classification
        active_forms = (
            crud.db_session.query(FormTemplateOrmV2)
            .filter_by(form_classification_id=form_classification_id, archived=False)
            .all()
        )
        assert len(active_forms) == 1
        assert active_forms[0].id == form_v2_id

    finally:
        if form_v2_id:
            crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=form_v2_id)
            crud.delete_all(FormTemplateOrmV2, id=form_v2_id)
        if form_v1_id:
            crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=form_v1_id)
            crud.delete_all(FormTemplateOrmV2, id=form_v1_id)
        if form_classification_id:
            crud.delete_all(FormClassificationOrmV2, id=form_classification_id)
        for string_id in lang_ids:
            crud.delete_all(LangVersionOrmV2, string_id=string_id)
