from __future__ import annotations

import json
import types
from typing import Any

from data.marshal import unmarshal
from models import FormTemplateOrm


def _create_lang_version(
    *,
    lang: str,
    question_text: str = "LV text",
    mc_options: list | None = None,
    **extras: Any,
) -> dict:
    """
    Construct a minimal dictionary representing a language version.

    :param lang: Language code of the language version.
    :param question_text: Question text of the language version.
    :param mc_options: Multiple choice options for the language version.
    :param **extras: Any additional key-value pairs to be included in the language version dictionary.
    :return: A dictionary representing the language version with the given parameters.
    """
    d = {"lang": lang, "question_text": question_text, **extras}
    if mc_options is not None:
        d["mc_options"] = mc_options
    return d


def _create_question(
    *,
    id: str = "q-001",
    question_index: int = 0,
    question_text: str = "Q?",
    visible_condition: dict | str | None = None,
    mc_options: list | str | None = None,
    answers: dict | None = None,
    lang_versions: list[dict] | list | None = None,
    **extras: Any,
) -> dict:
    """
    Construct a Question payload.

    :param id: ID of the question.
    :param question_index: Index of the question in the form.
    :param question_text: Text of the question.
    :param visible_condition: Visible condition for the question.
    :param mc_options: List of multiple choice options for the question.
    :param answers: Answers to the question.
    :param lang_versions: List of language versions associated with the question.
    :param **extras: Additional key-value pairs to be included in the payload.
    :return: Question payload dictionary.
    """
    d = {
        "id": id,
        "question_index": question_index,
        "question_text": question_text,
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
    """
    Construct a FormTemplate payload.

    :param id: ID of the form template.
    :param version: Version of the form template.
    :param archived: Whether the form template is archived.
    :param form_classification_id: Form classification ID associated with the form template.
    :param questions: List of questions associated with the form template.
    :param **extras: Additional key-value pairs to be included in the payload.
    :return: FormTemplate payload dictionary.
    """
    d = {"id": id, "archived": archived, **extras}
    if version is not None:
        d["version"] = version
    if form_classification_id is not None:
        d["form_classification_id"] = form_classification_id
    if questions is not None:
        d["questions"] = questions
    return d

def test_unmarshal_form_template_with_questions_pops_key_and_attaches_processed_questions(
    schema_loads_by_model,
):
    """
    For FormTemplate:
    - __unmarshal_form_template must REMOVE 'questions' from the dict passed to FormTemplate schema().load.
    - It must attach a 'questions' list on the returned instance, where:
        * Question.visible_condition, mc_options, answers are JSON-encoded strings.
        * For each lang version, mc_options list is JSON-encoded string.
    - Order of questions is preserved (no sorting during unmarshal).
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
                        lang="en", question_text="Headache?", mc_options=["yes", "no"]
                    ),
                    _create_lang_version(
                        lang="fr",
                        question_text="Maux de tête?",
                        mc_options=["oui", "non"],
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
                    _create_lang_version(lang="en", question_text="Dizziness?")
                ],
            ),
        ],
    )

    fom_template = unmarshal(FormTemplateOrm, payload)
    assert isinstance(fom_template, types.SimpleNamespace)
    assert fom_template.id == "t-qa"
    assert fom_template.version == "v2"
    assert fom_template.archived is False
    assert getattr(fom_template, "form_classification_id", None) == "fc-99"

    # Questions are attached and processed
    assert hasattr(fom_template, "questions")
    assert isinstance(fom_template.questions, list) and len(fom_template.questions) == 2

    q0, q1 = fom_template.questions[0], fom_template.questions[1]  # order preserved
    assert q0.id == "q-1" and q0.question_index == 2
    assert q1.id == "q-0" and q1.question_index == 0

    # JSON encodings for q0
    assert isinstance(q0.visible_condition, str)
    assert json.loads(q0.visible_condition) == {"all": [{"field": "age", "gt": 10}]}
    assert isinstance(q0.mc_options, str) and json.loads(q0.mc_options) == ["yes", "no"]
    assert isinstance(q0.answers, str) and json.loads(q0.answers) == {"value": None}
    assert hasattr(q0, "lang_versions") and len(q0.lang_versions) == 2
    en_lv, fr_lv = q0.lang_versions
    assert en_lv.lang == "en" and en_lv.question_text == "Headache?"
    assert isinstance(en_lv.mc_options, str) and json.loads(en_lv.mc_options) == [
        "yes",
        "no",
    ]
    assert fr_lv.lang == "fr" and fr_lv.question_text == "Maux de tête?"
    assert isinstance(fr_lv.mc_options, str) and json.loads(fr_lv.mc_options) == [
        "oui",
        "non",
    ]

    # JSON encodings for q1
    assert json.loads(q1.visible_condition) == {
        "any": [{"field": "pregnant", "eq": True}]
    }
    assert json.loads(q1.mc_options) == ["mild", "severe"]
    assert json.loads(q1.answers) == {"value": "mild"}
    assert len(q1.lang_versions) == 1 and q1.lang_versions[0].lang == "en"

    # Schema load assertions (use fixture)
    tmpl_loads = schema_loads_by_model("FormTemplateOrm")
    assert tmpl_loads, "Expected a schema.load for FormTemplateOrm"
    form_template_payload = tmpl_loads[-1]
    assert (
        "questions" not in form_template_payload
    ), "FormTemplate schema().load must NOT receive 'questions'"

    # Ensure question and lang version loads happened
    question_loads = schema_loads_by_model("QuestionOrm")
    lang_ver_loads = schema_loads_by_model("QuestionLangVersionOrm")
    assert len(question_loads) == 2
    assert len(lang_ver_loads) == 3


def test_unmarshal_form_template_with_questions_empty_list_still_pops_key_and_sets_empty_attr(
    schema_loads_by_model,
):
    """
    Test that unmarshalling a form template payload with an empty questions list
    correctly leaves the questions attribute empty, and does not call schema().load
    for QuestionOrm or QuestionLangVersionOrm.
    """
    payload = _create_form_template(id="t-empty", questions=[])

    fom_template = unmarshal(FormTemplateOrm, payload)
    assert hasattr(fom_template, "questions") and fom_template.questions == []

    tmpl_loads = schema_loads_by_model("FormTemplateOrm")
    assert tmpl_loads, "Expected a schema.load for FormTemplateOrm"
    form_template_payload = tmpl_loads[-1]
    assert "questions" not in form_template_payload

    # No question/lang-version loads
    assert not schema_loads_by_model("QuestionOrm")
    assert not schema_loads_by_model("QuestionLangVersionOrm")


def test_unmarshal_form_template_without_questions_key_sets_empty_attr_and_no_question_loads(
    schema_loads_by_model,
):
    """
    Test that unmarshalling a form template payload without a 'questions' key
    - still sets the 'questions' attribute to an empty list
    - does not call schema().load for QuestionOrm or QuestionLangVersionOrm
    """
    payload = _create_form_template(id="t-absent")  # no 'questions' key

    fom_template = unmarshal(FormTemplateOrm, payload)
    assert hasattr(fom_template, "questions") and fom_template.questions == []

    tmpl_loads = schema_loads_by_model("FormTemplateOrm")
    assert tmpl_loads, "Expected a schema.load for FormTemplateOrm"
    form_template_payload = tmpl_loads[-1]
    assert "questions" not in form_template_payload

    assert not schema_loads_by_model("QuestionOrm")
    assert not schema_loads_by_model("QuestionLangVersionOrm")
