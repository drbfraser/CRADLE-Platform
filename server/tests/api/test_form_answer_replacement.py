import json
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from pydantic import ValidationError
from werkzeug.exceptions import Forbidden, HTTPException

from api.resources import forms_v2
from common import form_utils
from enums import QuestionTypeEnum
from models import FormAnswerOrmV2, FormSubmissionOrmV2
from validation.formsV2_models import (
    FormIdPath,
    ReplaceFormRequestBody,
    UpdateFormRequestBody,
)


@pytest.fixture
def form_context(monkeypatch):
    questions = [
        SimpleNamespace(
            id=question_id,
            required=question_id == "required",
            question_type=QuestionTypeEnum.STRING,
            string_max_length=100,
        )
        for question_id in ("required", "optional", "new")
    ]
    template = SimpleNamespace(questions=questions)
    form = FormSubmissionOrmV2(
        id="submission",
        form_template_id="template",
        patient_id="patient",
        user_id=1,
        date_submitted=100,
        last_edited=100,
        lang="English",
        archived=False,
        revision=1,
        answers=[
            FormAnswerOrmV2(
                id=question_id + "-answer",
                question_id=question_id,
                answer=json.dumps({"text": "Original", "comment": None}),
            )
            for question_id in ("required", "optional")
        ],
    )
    session = Mock()
    monkeypatch.setattr(
        forms_v2, "load_authorized_patient_resource", Mock(return_value=form)
    )
    query = session.query.return_value.filter_by.return_value
    query.populate_existing.return_value.with_for_update.return_value.one_or_none.return_value = form
    monkeypatch.setattr(forms_v2.crud, "db_session", session)
    monkeypatch.setattr(forms_v2.crud, "read", Mock(return_value=template))
    monkeypatch.setattr(
        forms_v2.user_utils, "get_current_user_from_jwt", lambda: {"id": 7}
    )
    monkeypatch.setattr(forms_v2, "get_current_time", lambda: 100)
    return form, template, session


def replacement(answers=None, revision=1):
    if answers is None:
        answers = [{"question_id": "required", "answer": {"text": "Updated"}}]
    return ReplaceFormRequestBody(
        expected_revision=revision,
        answers=answers,
    )


def test_replacement_checks_patient_access_before_locking(form_context, monkeypatch):
    form, _, session = form_context
    monkeypatch.setattr(
        forms_v2, "load_authorized_patient_resource", Mock(side_effect=Forbidden())
    )
    with pytest.raises(Forbidden):
        forms_v2.replace_form_answers(
            FormIdPath(form_submission_id=form.id), replacement()
        )
    session.query.assert_not_called()
    session.commit.assert_not_called()


def test_replace_updates_adds_and_omits_optional_answers(form_context):
    form, _, session = form_context
    body = replacement(
        [
            {"question_id": "required", "answer": {"text": "Updated"}},
            {"question_id": "new", "answer": {"text": "Added"}},
        ]
    )
    result, status = forms_v2.replace_form_answers(
        FormIdPath(form_submission_id=form.id), body
    )
    assert status == 200
    assert result["revision"] == 2
    assert form.user_id == 7
    assert form.date_submitted == 100
    assert form.patient_id == "patient"
    assert form.form_template_id == "template"
    assert [answer.question_id for answer in form.answers] == ["required", "new"]
    assert form.answers[0].id == "required-answer"
    assert json.loads(form.answers[1].answer)["text"] == "Added"
    session.commit.assert_called_once()


def test_clearing_all_optional_answers_can_be_read_back(form_context):
    form, template, session = form_context
    for question in template.questions:
        question.required = False
    path = FormIdPath(form_submission_id=form.id)

    _, status = forms_v2.replace_form_answers(path, replacement(answers=[]))
    assert status == 200
    result = forms_v2.get_form(path)

    assert result["answers"] == []
    assert result["revision"] == 2
    assert result["id"] == form.id
    session.commit.assert_called_once()


@pytest.mark.parametrize("revision, archived", [(2, False), (1, True)])
def test_stale_or_archived_form_is_not_changed(form_context, revision, archived):
    form, _, session = form_context
    form.revision = revision
    form.archived = archived
    with pytest.raises(HTTPException) as error:
        forms_v2.replace_form_answers(
            FormIdPath(form_submission_id=form.id), replacement()
        )
    assert error.value.code == 409
    assert json.loads(form.answers[0].answer)["text"] == "Original"
    session.commit.assert_not_called()


@pytest.mark.parametrize(
    "answers",
    [
        [],
        [{"question_id": "required", "answer": {"text": ""}}],
        [{"question_id": "required", "answer": {"number": 1}}],
        [{"question_id": "required", "answer": {"text": "x" * 101}}],
        [
            {"question_id": "required", "answer": {"text": "Updated"}},
            {"question_id": "foreign", "answer": {"text": "Wrong template"}},
        ],
    ],
)
def test_invalid_replacement_keeps_all_original_answers(form_context, answers):
    form, _, session = form_context
    original = list(form.answers)
    with pytest.raises(HTTPException) as error:
        forms_v2.replace_form_answers(
            FormIdPath(form_submission_id=form.id), replacement(answers)
        )
    assert error.value.code == 422
    assert form.answers == original
    assert json.loads(form.answers[0].answer)["text"] == "Original"
    assert form.revision == 1
    session.commit.assert_not_called()


def test_patch_invalidates_an_earlier_revision_even_in_the_same_second(form_context):
    form, _, session = form_context
    path = FormIdPath(form_submission_id=form.id)
    forms_v2.update_form(
        path,
        UpdateFormRequestBody(
            answers=[
                {
                    "id": "required-answer",
                    "answer": {"text": "Web edit"},
                }
            ]
        ),
    )
    assert form.last_edited == 100
    assert form.revision == 2
    with pytest.raises(HTTPException) as error:
        forms_v2.replace_form_answers(path, replacement())
    assert error.value.code == 409
    assert json.loads(form.answers[0].answer)["text"] == "Web edit"
    session.commit.assert_called_once()


def test_unchanged_expired_date_does_not_block_other_edits(form_context):
    form, template, _ = form_context
    template.questions[1] = SimpleNamespace(
        id="optional",
        required=False,
        question_type=QuestionTypeEnum.DATE,
        allow_past_dates=False,
        allow_future_dates=None,
    )
    form.answers[1].answer = json.dumps({"date": "1"})
    body = replacement(
        [
            {"question_id": "required", "answer": {"text": "Updated"}},
            {"question_id": "optional", "answer": {"date": "1"}},
        ]
    )
    assert form_utils.validate_replacement_answers(form, body.answers).ok
    body.answers[1].answer.date = "2"
    assert not form_utils.validate_replacement_answers(form, body.answers).ok


@pytest.mark.parametrize(
    "body",
    [
        {"answers": []},
        {"expectedRevision": 0, "answers": []},
        {"expectedRevision": True, "answers": []},
        {
            "expectedRevision": 1,
            "answers": [
                {"questionId": "q", "answer": {"text": "one"}},
                {"questionId": "q", "answer": {"text": "two"}},
            ],
        },
        {"expectedRevision": 1, "answers": [{"questionId": "q", "answer": None}]},
    ],
)
def test_replacement_requires_revision_and_unique_non_null_answers(body):
    with pytest.raises(ValidationError):
        ReplaceFormRequestBody(**body)


def test_replacement_accepts_camel_case_contract():
    body = ReplaceFormRequestBody(
        expectedRevision=1,
        answers=[
            {
                "questionId": "q",
                "answer": {"text": "Answer"},
            }
        ],
    )
    assert body.expected_revision == 1
    assert body.answers[0].question_id == "q"
