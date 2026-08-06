from humps import decamelize

import data.db_operations as crud
from common.commonUtil import get_uuid
from enums import QuestionTypeEnum
from models import (
    FormClassificationOrmV2,
    FormQuestionTemplateOrmV2,
    FormTemplateOrmV2,
    LangVersionOrmV2,
)


def _cleanup_template_resources(
    *,
    created_template_ids=None,
    created_classification_ids=None,
    created_lang_versions=None,
):
    for template_id in created_template_ids or []:
        crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=template_id)
        crud.delete_all(FormTemplateOrmV2, id=template_id)

    for classification_id in created_classification_ids or []:
        crud.delete_all(FormClassificationOrmV2, id=classification_id)

    for string_id in created_lang_versions or []:
        crud.delete_all(LangVersionOrmV2, string_id=string_id)


def _collect_lang_version_ids(classification, template):
    lang_ids = [classification.name_string_id]
    for question in template.questions:
        lang_ids.append(question.question_string_id)
    return lang_ids


def _create_template(database, api_post, form_template_v2_payload, **payload_kwargs):
    payload = form_template_v2_payload(**payload_kwargs)
    response = api_post("/api/forms/v2/templates/body", json=payload)
    assert response.status_code == 201

    database.session.flush()
    database.session.commit()

    body = decamelize(response.json())
    classification = crud.read(
        FormClassificationOrmV2, id=body["form_classification_id"]
    )
    template = crud.read(FormTemplateOrmV2, id=body["id"])

    return {
        "body": body,
        "payload": payload,
        "classification": classification,
        "template": template,
        "lang_ids": _collect_lang_version_ids(classification, template),
    }


def _localized_text(value: dict | str) -> str:
    if isinstance(value, str):
        return value

    for key in ("english", "English", "french", "French"):
        if key in value:
            return value[key]

    return next(iter(value.values()))


def test_get_form_template_v2_by_id(
    database, form_template_v2_payload, api_post, api_get
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []

    try:
        created = _create_template(database, api_post, form_template_v2_payload)
        body = created["body"]
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])
        created_lang_versions.extend(created["lang_ids"])

        response = api_get(endpoint=f"/api/forms/v2/templates/{body['id']}")
        assert response.status_code == 200

        template = decamelize(response.json())
        assert template["id"] == body["id"]
        assert template["version"] == created["payload"]["version"]
        assert len(template["questions"]) == len(created["payload"]["questions"])

        heart_rate_question = next(
            question for question in template["questions"] if question["order"] == 1
        )
        assert _localized_text(heart_rate_question["question_text"]) == "Heart rate"
        assert _localized_text(template["classification"]["name"]) == "Vitals Form"

    finally:
        _cleanup_template_resources(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
        )


def test_get_form_template_v2_with_lang(
    database, form_template_v2_payload, api_post, api_get
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []

    try:
        created = _create_template(
            database,
            api_post,
            form_template_v2_payload,
            overrides={
                "classification": {
                    "name": {
                        "english": "Vitals Form",
                        "french": "Formulaire de signes vitaux",
                    },
                },
                "questions": [
                    {
                        "question_type": QuestionTypeEnum.CATEGORY.value,
                        "order": 0,
                        "required": False,
                        "question_text": {
                            "english": "Vitals",
                            "french": "Signes vitaux",
                        },
                        "mc_options": [],
                    },
                    {
                        "question_type": QuestionTypeEnum.INTEGER.value,
                        "order": 1,
                        "required": True,
                        "question_text": {
                            "english": "Heart rate",
                            "french": "Frequence cardiaque",
                        },
                        "num_min": 0,
                        "num_max": 300,
                        "category_index": 0,
                        "user_question_id": "heart_rate",
                        "mc_options": [],
                    },
                ],
            },
        )
        body = created["body"]
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])
        created_lang_versions.extend(created["lang_ids"])

        response = api_get(
            endpoint=f"/api/forms/v2/templates/{body['id']}?lang=french"
        )
        assert response.status_code == 200

        template = decamelize(response.json())
        heart_rate_question = next(
            question for question in template["questions"] if question["order"] == 1
        )
        assert _localized_text(heart_rate_question["question_text"]) == (
            "Frequence cardiaque"
        )
        assert _localized_text(template["classification"]["name"]) == (
            "Formulaire de signes vitaux"
        )

    finally:
        _cleanup_template_resources(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
        )


def test_list_form_templates_v2(database, form_template_v2_payload, api_post, api_get):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []

    try:
        list_before = api_get(endpoint="/api/forms/v2/templates")
        assert list_before.status_code == 200
        existing_count = len(decamelize(list_before.json())["templates"])

        created = _create_template(database, api_post, form_template_v2_payload)
        body = created["body"]
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])
        created_lang_versions.extend(created["lang_ids"])

        response = api_get(endpoint="/api/forms/v2/templates")
        assert response.status_code == 200

        templates = decamelize(response.json())["templates"]
        assert len(templates) == existing_count + 1

        listed_template = next(
            template for template in templates if template["id"] == body["id"]
        )
        assert listed_template["version"] == created["payload"]["version"]
        assert listed_template["name"] == "Vitals Form"
        assert listed_template["archived"] is False

    finally:
        _cleanup_template_resources(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
        )


def test_get_template_languages(database, form_template_v2_payload, api_post, api_get):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []

    try:
        created = _create_template(
            database,
            api_post,
            form_template_v2_payload,
            overrides={
                "classification": {
                    "name": {
                        "english": "Vitals Form",
                        "french": "Formulaire de signes vitaux",
                    },
                },
            },
        )
        body = created["body"]
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])
        created_lang_versions.extend(created["lang_ids"])

        response = api_get(
            endpoint=f"/api/forms/v2/templates/{body['id']}/languages"
        )
        assert response.status_code == 200

        languages = {
            lang.lower() for lang in decamelize(response.json())["lang_versions"]
        }
        assert languages == {"english", "french"}

    finally:
        _cleanup_template_resources(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
        )


def test_export_template_csv(database, form_template_v2_payload, api_post, api_get):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []

    try:
        created = _create_template(database, api_post, form_template_v2_payload)
        body = created["body"]
        template_version = created["payload"]["version"]
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])
        created_lang_versions.extend(created["lang_ids"])

        response = api_get(
            endpoint=(
                f"/api/forms/v2/templates/{body['id']}/versions/{template_version}/csv"
            )
        )
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("Content-Type", "")

        csv_text = response.text
        assert "Question ID" in csv_text
        assert "Heart rate" in csv_text
        assert "Vitals Form" in csv_text
        assert "Version" in csv_text
        assert str(template_version) in csv_text

    finally:
        _cleanup_template_resources(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
        )


def test_form_version_update_archives_previous_and_creates_new(
    database, api_post, form_template_v2_payload
):
    form_v1_id = None
    form_v2_id = None
    form_classification_id = None
    lang_ids = []

    try:
        form_name = f"Version Test Form {get_uuid()}"

        v1_payload = form_template_v2_payload(
            overrides={"classification": {"name": {"english": form_name}}}
        )
        v1_response = api_post("/api/forms/v2/templates/body", json=v1_payload)
        database.session.commit()
        assert v1_response.status_code == 201

        v1_body = decamelize(v1_response.json())
        form_v1_id = v1_body["id"]
        form_classification_id = v1_body["form_classification_id"]

        classification = crud.read(FormClassificationOrmV2, id=form_classification_id)
        form_v1_orm = crud.read(FormTemplateOrmV2, id=form_v1_id)
        lang_ids.append(classification.name_string_id)
        for question in form_v1_orm.questions:
            lang_ids.append(question.question_string_id)

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
        v2_response = api_post("/api/forms/v2/templates/body", json=v2_payload)
        database.session.commit()
        assert v2_response.status_code == 201

        v2_body = decamelize(v2_response.json())
        form_v2_id = v2_body["id"]

        form_v2_orm = crud.read(FormTemplateOrmV2, id=form_v2_id)
        for question in form_v2_orm.questions:
            lang_ids.append(question.question_string_id)

        assert form_v2_id != form_v1_id
        assert v2_body["form_classification_id"] == form_classification_id
        assert form_v2_orm.version == 2
        assert form_v2_orm.archived is False

        form_v1_orm = crud.read(FormTemplateOrmV2, id=form_v1_id)
        assert form_v1_orm.archived is True

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
