from __future__ import annotations

import json

from data import orm_serializer
from models import FormOrm
from tests.helpers import make_form, make_question, make_question_lang_version


def test_unmarshal_form_attaches_questions_and_encodes_nested_fields():
    """
    Test that unmarshalling a form payload with questions and lang versions
    correctly attaches the questions and encodes nested fields.
    """
    form_payload = make_form(
        id="f-001",
        questions=[
            make_question(
                id="q-1",
                question_index=2,
                question_text="Any symptoms?",
                question_type="MULTIPLE_CHOICE",
                visible_condition={"depends_on": "q-0", "equals": "yes"},
                mc_options=[
                    {"value": "y", "label": "Yes"},
                    {"value": "n", "label": "No"},
                ],
                answers={"selected": "y"},
                lang_versions=[
                    make_question_lang_version(
                        lang="fr",
                        question_id="q-1",
                        question_text="Des symptômes ?",
                        mc_options=["Oui", "Non"],
                    )
                ],
            )
        ],
    )

    unmarshal_form = orm_serializer.unmarshal(FormOrm, form_payload)

    assert unmarshal_form.id == "f-001"
    assert hasattr(unmarshal_form, "questions")
    assert isinstance(unmarshal_form.questions, list)
    assert len(unmarshal_form.questions) == 1
    question = unmarshal_form.questions[0]

    assert isinstance(question.visible_condition, str)
    assert json.loads(question.visible_condition) == {
        "depends_on": "q-0",
        "equals": "yes",
    }

    assert isinstance(question.mc_options, str)
    assert json.loads(question.mc_options) == [
        {"value": "y", "label": "Yes"},
        {"value": "n", "label": "No"},
    ]

    assert isinstance(question.answers, str)
    assert json.loads(question.answers) == {"selected": "y"}

    assert hasattr(question, "lang_versions")
    assert len(question.lang_versions) == 1
    lang_version = question.lang_versions[0]
    assert isinstance(lang_version.mc_options, str)
    assert json.loads(lang_version.mc_options) == ["Oui", "Non"]
    assert lang_version.lang == "fr"
    assert lang_version.question_text == "Des symptômes ?"


def test_unmarshal_form_questions_empty_list_keeps_attribute_empty():
    """
    Test that unmarshalling a form payload with an empty questions list
    correctly leaves the questions attribute empty.
    """
    form_payload = make_form(id="f-002", questions=[])
    form = orm_serializer.unmarshal(FormOrm, form_payload)
    assert hasattr(form, "questions") and form.questions == []


def test_unmarshal_form_without_questions_attribute_is_absent():
    """
    Test that unmarshalling a form payload without a 'questions' attribute
    removes the 'questions' attribute from the resulting FormOrm object.
    """
    form_payload = make_form(id="f-003")
    form = orm_serializer.unmarshal(FormOrm, form_payload)
    assert not getattr(form, "questions", None)


def test_unmarshal_form_prunes_none_items_in_questions_and_lang_versions():
    """
    Test that unmarshalling a form payload with None values in questions and
    lang_versions correctly removes these attributes and leaves the resulting
    FormOrm object with the expected structure.
    """
    form_payload = make_form(
        id="f-004",
        questions=[
            None,
            make_question(
                id="q-keep",
                question_index=1,
                question_text="Pick one",
                question_type="MULTIPLE_CHOICE",
                visible_condition=None,
                mc_options=[],
                answers=None,
                lang_versions=[
                    None,
                    make_question_lang_version(
                        lang="es",
                        question_id="q-keep",
                        question_text="Elige uno",
                        mc_options=[],
                    ),
                ],
            ),
        ],
    )

    unmarshal_form = orm_serializer.unmarshal(FormOrm, form_payload)

    assert hasattr(unmarshal_form, "questions") and len(unmarshal_form.questions) == 1
    question = unmarshal_form.questions[0]
    assert question.id == "q-keep"

    assert not getattr(question, "visible_condition", None)

    assert (
        isinstance(question.mc_options, str) and json.loads(question.mc_options) == []
    )

    assert not getattr(question, "answers", None)

    assert hasattr(question, "lang_versions") and len(question.lang_versions) == 1
    lv = question.lang_versions[0]
    assert lv.lang == "es"
    assert isinstance(lv.mc_options, str) and json.loads(lv.mc_options) == []


def test_unmarshal_form_mixed_mc_options_list_and_string_pass_through():
    """
    Test that unmarshalling a form payload with questions that have both string and list
    mc_options works as expected.

    - "q-str" has pre-encoded string mc_options which should remain a string.
    - "q-list" has list mc_options which should be encoded to a string.
    """
    form_payload = make_form(
        id="f-005",
        questions=[
            make_question(
                id="q-str",
                question_index=0,
                question_type="MULTIPLE_CHOICE",
                mc_options='["A","B"]',
            ),
            make_question(
                id="q-list",
                question_index=1,
                question_type="MULTIPLE_CHOICE",
                mc_options=["X", "Y"],
            ),
        ],
    )

    form = orm_serializer.unmarshal(FormOrm, form_payload)
    q1, q2 = sorted(form.questions, key=lambda x: x.question_index)

    assert q1.id == "q-str"
    assert isinstance(q1.mc_options, str)
    assert q1.mc_options == '["A","B"]'
    assert json.loads(q1.mc_options) == ["A", "B"]

    assert q2.id == "q-list"
    assert isinstance(q2.mc_options, str)
    assert json.loads(q2.mc_options) == ["X", "Y"]
