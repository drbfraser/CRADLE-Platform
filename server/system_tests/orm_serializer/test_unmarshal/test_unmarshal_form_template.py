from __future__ import annotations

import json
from typing import Any

from data import orm_serializer
from models import FormTemplateOrm


def _create_lang_version(
    *,
    lang: str,
    question_text: str = "LV text",
    mc_options: list | None = None,
    question_id: str | None = None,
    **extras: Any,
) -> dict:
    d = {"lang": lang, "question_text": question_text, **extras}
    if mc_options is not None:
        d["mc_options"] = mc_options
    if question_id is not None:
        d["question_id"] = question_id
    return d


def _create_question(
    *,
    id: str = "q-001",
    question_index: int = 0,
    question_text: str = "Q?",
    question_type: str = "MULTIPLE_CHOICE",
    visible_condition: dict | str | None = None,
    mc_options: list | str | None = None,
    answers: dict | None = None,
    lang_versions: list[dict] | None = None,
    **extras: Any,
) -> dict:
    d: dict[str, Any] = {
        "id": id,
        "question_index": question_index,
        "question_text": question_text,
        "question_type": question_type,
        **extras,
    }
    if visible_condition is not None:
        d["visible_condition"] = visible_condition
    if mc_options is not None:
        d["mc_options"] = mc_options
    if answers is not None:
        d["answers"] = answers
    if lang_versions is not None:
        d["lang_versions"] = lang_versions
    return d


def _create_form_template(
    *,
    id: str = "t-001",
    version: str | None = "v1",
    archived: bool = False,
    form_classification_id: str | None = "fc-001",
    questions: list[dict] | None = None,
    **extras: Any,
) -> dict:
    d: dict[str, Any] = {"id": id, "archived": archived, **extras}
    if version is not None:
        d["version"] = version
    if form_classification_id is not None:
        d["form_classification_id"] = form_classification_id
    if questions is not None:
        d["questions"] = questions
    return d


def test_unmarshal_form_template_with_questions_attaches_and_encodes_nested_fields():
    """
    Test that unmarshalling a form template payload with questions and lang versions
    correctly attaches the questions and encodes nested fields.
    """
    payload = _create_form_template(
        id="t-qa",
        version="v2",
        archived=False,
        form_classification_id="fc-99",
        questions=[
            _create_question(
                id="q-1",
                question_index=2,
                question_text="Headache?",
                visible_condition={"all": [{"field": "age", "gt": 10}]},
                mc_options=["yes", "no"],
                answers={"value": None},
                lang_versions=[
                    _create_lang_version(
                        lang="en",
                        question_text="Headache?",
                        mc_options=["yes", "no"],
                        question_id="q-1",
                    ),
                    _create_lang_version(
                        lang="fr",
                        question_text="Maux de tête?",
                        mc_options=["oui", "non"],
                        question_id="q-1",
                    ),
                ],
            ),
            _create_question(
                id="q-0",
                question_index=0,
                question_text="Dizziness?",
                visible_condition={"any": [{"field": "pregnant", "eq": True}]},
                mc_options=["mild", "severe"],
                answers={"value": "mild"},
                lang_versions=[
                    _create_lang_version(
                        lang="en",
                        question_text="Dizziness?",
                        question_id="q-0",
                    )
                ],
            ),
        ],
    )

    tmpl = orm_serializer.unmarshal(FormTemplateOrm, payload)
    assert isinstance(tmpl, FormTemplateOrm)
    assert tmpl.id == "t-qa"
    assert tmpl.version == "v2"
    assert tmpl.archived is False
    assert getattr(tmpl, "form_classification_id", None) == "fc-99"

    assert hasattr(tmpl, "questions")
    assert isinstance(tmpl.questions, list) and len(tmpl.questions) == 2

    q0, q1 = tmpl.questions[0], tmpl.questions[1]
    assert q0.id == "q-1" and q0.question_index == 2
    assert q1.id == "q-0" and q1.question_index == 0

    # Encoded JSON fields on q0
    assert isinstance(q0.visible_condition, str)
    assert json.loads(q0.visible_condition) == {"all": [{"field": "age", "gt": 10}]}
    assert isinstance(q0.mc_options, str)
    assert json.loads(q0.mc_options) == ["yes", "no"]
    assert isinstance(q0.answers, str)
    assert json.loads(q0.answers) == {"value": None}

    # Lang versions exist and mc_options encoded
    assert hasattr(q0, "lang_versions") and len(q0.lang_versions) == 2
    lv_en, lv_fr = q0.lang_versions
    assert lv_en.lang == "en" and lv_en.question_text == "Headache?"
    assert isinstance(lv_en.mc_options, str)
    assert json.loads(lv_en.mc_options) == ["yes", "no"]

    assert lv_fr.lang == "fr" and lv_fr.question_text == "Maux de tête?"
    assert isinstance(lv_fr.mc_options, str)
    assert json.loads(lv_fr.mc_options) == ["oui", "non"]

    # Encoded JSON fields on q1
    assert isinstance(q1.visible_condition, str)
    assert json.loads(q1.visible_condition) == {
        "any": [{"field": "pregnant", "eq": True}]
    }
    assert isinstance(q1.mc_options, str)
    assert json.loads(q1.mc_options) == ["mild", "severe"]
    assert isinstance(q1.answers, str)
    assert json.loads(q1.answers) == {"value": "mild"}
    assert len(q1.lang_versions) == 1 and q1.lang_versions[0].lang == "en"


def test_unmarshal_form_template_with_empty_questions_sets_empty_attr():
    """
    Test that unmarshalling a form template payload with an empty questions list
    correctly sets the questions attribute to an empty list.
    """
    payload = _create_form_template(id="t-empty", questions=[])

    tmpl = orm_serializer.unmarshal(FormTemplateOrm, payload)
    assert hasattr(tmpl, "questions") and tmpl.questions == []


def test_unmarshal_form_template_without_questions_key_sets_empty_attr():
    """
    Test that unmarshalling a form template payload without a 'questions' key
    correctly sets the questions attribute to an empty list.
    """
    payload = _create_form_template(id="t-absent")  # no 'questions' key

    tmpl = orm_serializer.unmarshal(FormTemplateOrm, payload)
    assert hasattr(tmpl, "questions") and tmpl.questions == []
