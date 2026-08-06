from humps import decamelize

import data.db_operations as crud
from common.commonUtil import get_uuid
from enums import QuestionTypeEnum
from models import FormClassificationOrmV2, FormTemplateOrmV2


def _localized_text(value: dict | str) -> str:
    if isinstance(value, str):
        return value

    for key in ("english", "English", "french", "French"):
        if key in value:
            return value[key]

    return next(iter(value.values()))


def test_get_form_template_v2_by_id(api_get, form_v2_resources):
    created = form_v2_resources.create_template()
    body = created["body"]

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


def test_get_form_template_v2_with_lang(api_get, form_v2_resources):
    created = form_v2_resources.create_template(
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
        }
    )
    body = created["body"]

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


def test_list_form_templates_v2(api_get, form_v2_resources):
    list_before = api_get(endpoint="/api/forms/v2/templates")
    assert list_before.status_code == 200
    existing_count = len(decamelize(list_before.json())["templates"])

    created = form_v2_resources.create_template()
    body = created["body"]

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


def test_get_template_languages(api_get, form_v2_resources):
    created = form_v2_resources.create_template(
        overrides={
            "classification": {
                "name": {
                    "english": "Vitals Form",
                    "french": "Formulaire de signes vitaux",
                },
            },
        }
    )
    body = created["body"]

    response = api_get(endpoint=f"/api/forms/v2/templates/{body['id']}/languages")
    assert response.status_code == 200

    languages = {
        lang.lower() for lang in decamelize(response.json())["lang_versions"]
    }
    assert languages == {"english", "french"}


def test_export_template_csv(api_get, form_v2_resources):
    created = form_v2_resources.create_template()
    body = created["body"]
    template_version = created["payload"]["version"]

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


def test_form_version_update_archives_previous_and_creates_new(
    form_v2_resources,
):
    """
    Submitting a new form version (same classification, incremented version number) must:
    - produce a new row with a different UUID (not an in-place edit)
    - keep the same classification
    - archive the previous active version
    - leave exactly one active form under the classification
    """
    form_name = f"Version Test Form {get_uuid()}"

    v1 = form_v2_resources.create_template(
        overrides={"classification": {"name": {"english": form_name}}}
    )
    v2 = form_v2_resources.create_template_version(v1, version=2)

    form_v1_id = v1["body"]["id"]
    form_v2_id = v2["body"]["id"]
    form_classification_id = v1["body"]["form_classification_id"]

    assert form_v2_id != form_v1_id
    assert v2["body"]["form_classification_id"] == form_classification_id
    assert v2["template"].version == 2
    assert v2["template"].archived is False

    form_v1_orm = crud.read(FormTemplateOrmV2, id=form_v1_id)
    assert form_v1_orm.archived is True

    active_forms = (
        crud.db_session.query(FormTemplateOrmV2)
        .filter_by(form_classification_id=form_classification_id, archived=False)
        .all()
    )
    assert len(active_forms) == 1
    assert active_forms[0].id == form_v2_id


def test_create_form_template_v2(form_v2_resources):
    created = form_v2_resources.create_template()

    template = crud.read(FormTemplateOrmV2, id=created["body"]["id"])
    assert template is not None
    assert template.version == created["payload"]["version"]


def test_form_template_duplicate_version_rejected(api_post, form_v2_resources):
    created = form_v2_resources.create_template()

    response = api_post("/api/forms/v2/templates/body", json=created["payload"])
    assert response.status_code == 409


def test_form_template_graceful_failure(form_template_v2_payload, api_post):
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

    response = api_post("/api/forms/v2/templates/body", json=payload)
    assert response.status_code != 201
    assert crud.read(FormClassificationOrmV2, id=classification_id) is None


def test_archive_form_template_v2(database, api_put, form_v2_resources):
    created = form_v2_resources.create_template()
    body = created["body"]

    response = api_put(f"/api/forms/v2/templates/{body['id']}", json={"archived": True})
    assert response.status_code == 201
    database.session.commit()

    template = crud.read(FormTemplateOrmV2, id=body["id"])
    assert template.archived is True
