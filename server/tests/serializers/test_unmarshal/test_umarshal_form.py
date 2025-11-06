from __future__ import annotations

import json
from typing import Any

from data.marshal import unmarshal
from models import FormOrm


def _create_question(
    *,
    id: str,
    question_index: int = 0,
    question_text: str = "Q?",
    visible_condition: dict | str | None = None,
    mc_options: list | str | None = None,
    answers: dict | None = None,
    lang_versions: list[dict | None] | None = None,
    **extras: Any,
) -> dict:
    """
    Helper function to create a question dictionary for testing purposes.

    :param id: The ID of the question.
    :param question_index: The index of the question in the form.
    :param question_text: The text of the question.
    :param visible_condition: The visible condition of the question.
    :param mc_options: The multiple choice options of the question.
    :param answers: The answers to the question.
    :param lang_versions: The language versions of the question.
    :param **extras: Any additional key-value pairs to be included in the question dictionary.
    :return: A dictionary representing the question.
    """
    return dict(
        id=id,
        question_index=question_index,
        question_text=question_text,
        visible_condition=visible_condition,
        mc_options=mc_options,
        answers=answers,
        lang_versions=lang_versions,
        **extras,
    )


def _create_lang_version(
    *,
    id: str,
    lang: str,
    question_text: str = "LV text",
    mc_options: list | None = None,
    **extras: Any,
) -> dict:
    """
    Helper function to create a language version dictionary for testing purposes.

    :param id: The ID of the language version.
    :param lang: The language code of the language version.
    :param question_text: The text of the language version.
    :param mc_options: The multiple choice options of the language version.
    :param **extras: Any additional key-value pairs to be included in the language version dictionary.
    :return: A dictionary representing the language version.
    """
    return dict(
        id=id,
        lang=lang,
        question_text=question_text,
        mc_options=mc_options,
        **extras,
    )


def _create_form(
    *,
    id: str,
    lang: str = "en",
    name: str = "Vitals",
    category: str = "screening",
    patient_id: str = "p-001",
    last_edited: int = 1_600_000_000,
    questions: list[dict | None] | None = None,
    **extras: Any,
) -> dict:
    """
    Helper function to create a form dictionary for testing purposes.

    :param id: The ID of the form.
    :param lang: The language code of the form.
    :param name: The name of the form.
    :param category: The category of the form.
    :param patient_id: The ID of the patient associated with the form.
    :param last_edited: The timestamp when the form was last edited.
    :param questions: The list of questions associated with the form.
    :param **extras: Any additional key-value pairs to be included in the form dictionary.
    :return: A dictionary representing the form.
    """
    payload = dict(
        id=id,
        lang=lang,
        name=name,
        category=category,
        patient_id=patient_id,
        last_edited=last_edited,
        **extras,
    )
    if questions is not object():
        payload["questions"] = questions
    return payload


def test_unmarshal_form_attaches_questions_and_encodes_nested_fields():
    """
    Test that unmarshalling a form payload with questions and lang versions
    correctly attaches the questions and encodes nested fields.
    """
    form_payload = _create_form(
        id="f-001",
        questions=[
            _create_question(
                id="q-1",
                question_index=2,
                question_text="Any symptoms?",
                visible_condition={"depends_on": "q-0", "equals": "yes"},
                mc_options=[
                    {"value": "y", "label": "Yes"},
                    {"value": "n", "label": "No"},
                ],
                answers={"selected": "y"},
                lang_versions=[
                    _create_lang_version(
                        id="lv-1",
                        lang="fr",
                        question_text="Des symptômes ?",
                        mc_options=["Oui", "Non"],
                    )
                ],
            )
        ],
    )

    unmarshal_form = unmarshal(FormOrm, form_payload)

    assert unmarshal_form.id == "f-001"
    assert hasattr(unmarshal_form, "questions")
    assert (
        isinstance(unmarshal_form.questions, list)
        and len(unmarshal_form.questions) == 1
    )
    question = unmarshal_form.questions[0]

    assert isinstance(question.visible_condition, str)
    assert json.loads(question.visible_condition) == {
        "depends_on": "q-0",
        "equals": "yes",
    }

    # mc_options list -> JSON string
    assert isinstance(question.mc_options, str)
    assert json.loads(question.mc_options) == [
        {"value": "y", "label": "Yes"},
        {"value": "n", "label": "No"},
    ]

    # answers dict -> JSON string
    assert isinstance(question.answers, str)
    assert json.loads(question.answers) == {"selected": "y"}

    # lang_versions attached and converted
    assert hasattr(question, "lang_versions")
    assert len(question.lang_versions) == 1
    lang_version = question.lang_versions[0]
    # mc_options list -> JSON string inside lang version
    assert isinstance(lang_version.mc_options, str)
    assert json.loads(lang_version.mc_options) == ["Oui", "Non"]
    assert lang_version.lang == "fr"
    assert lang_version.question_text == "Des symptômes ?"


def test_unmarshal_form_questions_empty_list_keeps_attribute_empty():
    """
    Test that unmarshalling a form payload with an empty questions list
    correctly leaves the questions attribute empty.
    """
    form_payload = _create_form(id="f-002", questions=[])
    form = unmarshal(FormOrm, form_payload)
    assert hasattr(form, "questions") and form.questions == []


def test_unmarshal_form_without_questions_attribute_is_absent():
    """
    Test that unmarshalling a form payload without a "questions" attribute
    does not create a questions attribute on the resulting FormOrm object.
    """
    form_payload = _create_form(id="f-003")
    form = unmarshal(FormOrm, form_payload)
    assert not hasattr(form, "questions")


def test_unmarshal_form_prunes_none_items_in_questions_and_lang_versions():
    """
    Test that unmarshalling a form payload with None values in questions and
    lang_versions correctly removes these attributes and leaves the resulting
    FormOrm object with the expected structure.

    - questions: list item with None removed
    - question: visible_condition None -> key removed before conversion -> attribute absent
    - question: mc_options empty list -> JSON "[]"
    - question: answers None -> pruned -> attribute absent
    - question: lang_versions: None entry dropped, one left and converted
    """
    form_payload = _create_form(
        id="f-004",
        questions=[
            None,
            _create_question(
                id="q-keep",
                question_index=1,
                question_text="Pick one",
                visible_condition=None,  # pruned, so no conversion happens
                mc_options=[],  # kept (not None), becomes "[]"
                answers=None,  # pruned
                lang_versions=[
                    None,
                    _create_lang_version(
                        id="lv-keep",
                        lang="es",
                        question_text="Elige uno",
                        mc_options=[],
                    ),
                ],
            ),
        ],
    )

    unmarshal_form = unmarshal(FormOrm, form_payload)

    assert hasattr(unmarshal_form, "questions") and len(unmarshal_form.questions) == 1
    question = unmarshal_form.questions[0]
    assert question.id == "q-keep"

    # visible_condition was None -> key removed before conversion -> attribute absent
    assert not hasattr(question, "visible_condition")

    # mc_options empty list -> JSON "[]"
    assert (
        isinstance(question.mc_options, str) and json.loads(question.mc_options) == []
    )

    # answers None -> pruned -> attribute absent
    assert not hasattr(question, "answers")

    # lang_versions: None entry dropped, one left and converted
    assert hasattr(question, "lang_versions") and len(question.lang_versions) == 1
    lv = question.lang_versions[0]
    assert lv.id == "lv-keep"
    assert lv.lang == "es"
    assert isinstance(lv.mc_options, str) and json.loads(lv.mc_options) == []


def test_unmarshal_form_mixed_mc_options_list_and_string_pass_through():
    """
    Test that unmarshalling a form payload with questions that have both string and list
    mc_options works as expected.

    - "q-str" has pre-encoded string mc_options which should remain a string.
    - "q-list" has list mc_options which should be encoded to a string.
    """
    form_payload = _create_form(
        id="f-005",
        questions=[
            _create_question(
                id="q-str",
                question_index=0,
                mc_options='["A","B"]',  # pre-encoded; should remain string
            ),
            _create_question(
                id="q-list",
                question_index=1,
                mc_options=["X", "Y"],  # list; should be encoded to string
            ),
        ],
    )

    form = unmarshal(FormOrm, form_payload)
    q1, q2 = sorted(form.questions, key=lambda x: x.question_index)

    assert q1.id == "q-str"
    assert isinstance(q1.mc_options, str)
    assert q1.mc_options == '["A","B"]'
    assert json.loads(q1.mc_options) == ["A", "B"]

    assert q2.id == "q-list"
    assert isinstance(q2.mc_options, str)
    assert json.loads(q2.mc_options) == ["X", "Y"]
