import json
import logging

from humps import decamelize

import data.db_operations as crud
from common.print_utils import pretty_print
from models import (
    FormAnswerOrmV2,
    FormClassificationOrmV2,
    FormQuestionTemplateOrmV2,
    FormSubmissionOrmV2,
    FormTemplateOrmV2,
    LangVersionOrmV2,
)

logger = logging.getLogger(__name__)


def test_create_form_submission_v2(
    database,
    create_patient,
    api_post,
    form_template_v2_payload,
    vht_user_id,
    patient_id,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []

    try:
        create_patient()

        # Create template
        r = api_post("/api/forms/v2/templates/body", json=form_template_v2_payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        body = decamelize(r.json())
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])

        classification = crud.read(
            FormClassificationOrmV2, id=body["form_classification_id"]
        )
        template = crud.read(FormTemplateOrmV2, id=body["id"])

        created_lang_versions.append(classification.name_string_id)
        for ques in template.questions:
            created_lang_versions.append(ques.question_string_id)

        # Create Submission
        submission_payload = {
            "patient_id": patient_id,
            "user_id": vht_user_id,
            "lang": "English",
            "form_template_id": body["id"],
            "answers": [
                {
                    "question_id": template.questions[1].id,
                    "answer": {"number": 90},
                }
            ],
        }

        r = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        pretty_print(r.json())

        submission = decamelize(r.json())
        created_submission_ids.append(submission["id"])

        # Validate
        assert submission["patient_id"] == patient_id
        assert submission["form_template_id"] == body["id"]

        submission_obj = crud.read(FormSubmissionOrmV2, id=submission["id"])

        assert submission_obj.answers[0].form_submission_id == submission["id"]
        actual = json.loads(submission_obj.answers[0].answer)
        assert actual["number"] == 90

    finally:
        for sid in created_submission_ids:
            crud.delete_all(FormAnswerOrmV2, form_submission_id=sid)
            crud.delete_all(FormSubmissionOrmV2, id=sid)

        for tid in created_template_ids:
            crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=tid)
            crud.delete_all(FormTemplateOrmV2, id=tid)

        for cid in created_classification_ids:
            crud.delete_all(FormClassificationOrmV2, id=cid)

        for lvid in created_lang_versions:
            crud.delete_all(LangVersionOrmV2, string_id=lvid)


def test_get_form_submission_v2(
    database,
    create_patient,
    api_post,
    api_get,
    patient_id,
    form_template_v2_payload,
    vht_user_id,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []

    try:
        create_patient()

        # Create template
        r = api_post("/api/forms/v2/templates/body", json=form_template_v2_payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        body = decamelize(r.json())
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])

        classification = crud.read(
            FormClassificationOrmV2, id=body["form_classification_id"]
        )
        template = crud.read(FormTemplateOrmV2, id=body["id"])

        created_lang_versions.append(classification.name_string_id)
        for ques in template.questions:
            created_lang_versions.append(ques.question_string_id)

        # Create Submission
        submission_payload = {
            "patient_id": patient_id,
            "user_id": vht_user_id,
            "lang": "English",
            "form_template_id": body["id"],
            "answers": [
                {
                    "question_id": template.questions[1].id,
                    "answer": {"number": 90},
                }
            ],
        }

        r = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert r.status_code == 201

        submission = decamelize(r.json())
        submission_id = submission["id"]
        created_submission_ids.append(submission_id)

        # Get submission
        r = api_get(f"/api/forms/v2/submissions/{submission_id}")
        assert r.status_code == 200

        body = decamelize(r.json())
        pretty_print(body)

        assert body["id"] == submission_id
        assert len(body["answers"]) == 1
        actual = body["answers"][0]
        assert actual["answer"]["number"] == 90

    finally:
        for sid in created_submission_ids:
            crud.delete_all(FormAnswerOrmV2, form_submission_id=sid)
            crud.delete_all(FormSubmissionOrmV2, id=sid)

        for tid in created_template_ids:
            crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=tid)
            crud.delete_all(FormTemplateOrmV2, id=tid)

        for cid in created_classification_ids:
            crud.delete_all(FormClassificationOrmV2, id=cid)

        for lvid in created_lang_versions:
            crud.delete_all(LangVersionOrmV2, string_id=lvid)


def test_update_form_submission_v2(
    database,
    create_patient,
    api_post,
    api_patch,
    patient_id,
    vht_user_id,
    form_template_v2_payload,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []

    try:
        create_patient()

        # Create template
        r = api_post("/api/forms/v2/templates/body", json=form_template_v2_payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        body = decamelize(r.json())
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])

        classification = crud.read(
            FormClassificationOrmV2, id=body["form_classification_id"]
        )
        template = crud.read(FormTemplateOrmV2, id=body["id"])

        created_lang_versions.append(classification.name_string_id)
        for ques in template.questions:
            created_lang_versions.append(ques.question_string_id)

        # Create Submission
        submission_payload = {
            "patient_id": patient_id,
            "user_id": vht_user_id,
            "lang": "English",
            "form_template_id": body["id"],
            "answers": [
                {
                    "question_id": template.questions[1].id,
                    "answer": {"number": 90},
                }
            ],
        }

        r = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        submission = decamelize(r.json())
        submission_id = submission["id"]
        submission_obj = crud.read(FormSubmissionOrmV2, id=submission["id"])
        answer_id = submission_obj.answers[0].id
        created_submission_ids.append(submission_id)

        # Patch update answer
        patch_payload = {
            "answers": [
                {
                    "id": answer_id,
                    "answer": {"number": 22},
                    "question_id": template.questions[1].id,
                }
            ]
        }

        r = api_patch(
            f"/api/forms/v2/submissions/{submission_id}",
            json=patch_payload,
        )
        logger.debug("%s", r.json())
        assert r.status_code == 200

        updated = decamelize(r.json())
        logger.debug("%s", updated)
        # assert updated["answers"][0]["answer"]["value"] == 22

    finally:
        for sid in created_submission_ids:
            crud.delete_all(FormAnswerOrmV2, form_submission_id=sid)
            crud.delete_all(FormSubmissionOrmV2, id=sid)

        for tid in created_template_ids:
            crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=tid)
            crud.delete_all(FormTemplateOrmV2, id=tid)

        for cid in created_classification_ids:
            crud.delete_all(FormClassificationOrmV2, id=cid)

        for lvid in created_lang_versions:
            crud.delete_all(LangVersionOrmV2, string_id=lvid)
