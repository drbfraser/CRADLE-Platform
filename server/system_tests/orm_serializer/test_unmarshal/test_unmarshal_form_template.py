from __future__ import annotations

import json

from data import orm_serializer
from models import FormTemplateOrm
from tests.helpers import make_form_template, make_question, make_question_lang_version


def test_unmarshal_form_template_with_questions_attaches_and_encodes_nested_fields():
    """
    Test that unmarshalling a form template payload with questions and lang versions
    correctly attaches the questions and encodes nested fields.
    """
    payload = make_form_template(
        id="t-qa",
        version="v2",
        archived=False,
        form_classification_id="fc-99",
        questions=[
            make_question(
                id="q-1",
                question_index=2,
                question_text="Headache?",
                visible_condition={"all": [{"field": "age", "gt": 10}]},
                mc_options=["yes", "no"],
                answers={"value": None},
                lang_versions=[
                    make_question_lang_version(
                        lang="en",
                        question_text="Headache?",
                        mc_options=["yes", "no"],
                        question_id="q-1",
                    ),
                    make_question_lang_version(
                        lang="fr",
                        question_text="Maux de tête?",
                        mc_options=["oui", "non"],
                        question_id="q-1",
                    ),
                ],
            ),
            make_question(
                id="q-0",
                question_index=0,
                question_text="Dizziness?",
                visible_condition={"any": [{"field": "pregnant", "eq": True}]},
                mc_options=["mild", "severe"],
                answers={"value": "mild"},
                lang_versions=[
                    make_question_lang_version(
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
    payload = make_form_template(id="t-empty", questions=[])

    tmpl = orm_serializer.unmarshal(FormTemplateOrm, payload)
    assert hasattr(tmpl, "questions") and tmpl.questions == []


def test_unmarshal_form_template_without_questions_key_sets_empty_attr():
    """
    Test that unmarshalling a form template payload without a 'questions' key
    correctly sets the questions attribute to an empty list.
    """
    payload = make_form_template(id="t-absent")  # no 'questions' key

    tmpl = orm_serializer.unmarshal(FormTemplateOrm, payload)
    assert hasattr(tmpl, "questions") and tmpl.questions == []
