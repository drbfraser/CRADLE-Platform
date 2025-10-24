from __future__ import annotations

import json
import types
from typing import Any

from data.marshal import unmarshal
from models import QuestionOrm


def _lang_version(
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


def _question(
    *,
    id: str = "q-001",
    is_blank: bool = False,
    question_index: int = 0,
    question_text: str = "Q?",
    question_type: str = "TEXT",
    has_comment_attached: bool = False,
    required: bool = False,
    allow_future_dates: bool = True,
    allow_past_dates: bool = True,
    units: str | None = None,
    visible_condition: dict | str | None = None,
    mc_options: list | str | None = None,
    num_min: float | None = None,
    num_max: float | None = None,
    string_max_length: int | None = None,
    answers: dict | None = None,
    category_index: int | None = None,
    string_max_lines: int | None = None,
    form_id: str | None = None,
    form_template_id: str | None = None,
    lang_versions: list[dict] | None = None,
    **extras: Any,
) -> dict:
    """
    Construct a minimal dictionary representing a QuestionOrm instance.

    :param id: ID of the question.
    :param is_blank: Whether the question is a blank template.
    :param question_index: Index of the question in the form.
    :param question_text: Question text of the question.
    :param question_type: Type of the question (integer, text, multiple choice, etc.).
    :param has_comment_attached: Whether the question has a comment field attached.
    :param required: Whether the question must be answered.
    :param allow_future_dates: Whether the question allows future dates as answers.
    :param allow_past_dates: Whether the question allows past dates as answers.
    :param units: Unit of measurement for the question.
    :param visible_condition: Visible condition for the question.
    :param mc_options: Multiple choice options for the question.
    :param num_min: Minimum numerical value allowed for the question.
    :param num_max: Maximum numerical value allowed for the question.
    :param string_max_length: Maximum length of text allowed for the question.
    :param answers: Answer to the question.
    :param category_index: Index of the category in the form.
    :param string_max_lines: Maximum number of lines of text allowed for the question.
    :param form_id: ID of the form associated with the question.
    :param form_template_id: ID of the form template associated with the question.
    :param lang_versions: List of language versions associated with the question.
    :param **extras: Any additional key-value pairs to be included in the question dictionary.
    :return: A dictionary representing the question with the given parameters.
    """
    d: dict[str, Any] = {
        "id": id,
        "is_blank": is_blank,
        "question_index": question_index,
        "question_text": question_text,
        "question_type": question_type,
        "has_comment_attached": has_comment_attached,
        "required": required,
        "allow_future_dates": allow_future_dates,
        "allow_past_dates": allow_past_dates,
        **extras,
    }
    if units is not None:
        d["units"] = units
    if visible_condition is not None:
        d["visible_condition"] = visible_condition
    if mc_options is not None:
        d["mc_options"] = mc_options
    if num_min is not None:
        d["num_min"] = num_min
    if num_max is not None:
        d["num_max"] = num_max
    if string_max_length is not None:
        d["string_max_length"] = string_max_length
    if answers is not None:
        d["answers"] = answers
    if category_index is not None:
        d["category_index"] = category_index
    if string_max_lines is not None:
        d["string_max_lines"] = string_max_lines
    if form_id is not None:
        d["form_id"] = form_id
    if form_template_id is not None:
        d["form_template_id"] = form_template_id
    if lang_versions is not None:
        d["lang_versions"] = lang_versions
    return d


def test_unmarshal_question_encodes_json_fields_and_detaches_lang_versions(
    schema_loads_by_model,
):
    """
    Test that unmarshalling a question payload with visible condition, mc options and
    answers fields correctly encodes these fields and detaches the lang versions.

    Also tests that the returned object is the stub (types.SimpleNamespace) with encoded
    fields and that the schema.load call removes the lang_versions and ensures the three
    fields are strings by the time they hit schema.load.

    The test also verifies that the two lang-version schema loads have occurred and that the
    'en' version mc_options should be an encoded string in the load payload, and the 'fr'
    version should not carry mc_options at all.
    """
    payload = _question(
        id="q-enc",
        question_index=3,
        question_text="Do you smoke?",
        question_type="MULTIPLE_CHOICE",
        visible_condition={"any": [{"field": "age", "gte": 18}]},
        mc_options=[{"mcId": 0, "opt": "Yes"}, {"mcId": 1, "opt": "No"}],
        answers={"mcIdArray": [1]},
        lang_versions=[
            _lang_version(
                lang="en", question_text="Do you smoke?", mc_options=["Yes", "No"]
            ),
            _lang_version(lang="fr", question_text="Fumez-vous?"),
        ],
    )

    unmarshal_question = unmarshal(QuestionOrm, payload)

    # Returned object is the stub (types.SimpleNamespace) with encoded fields
    assert isinstance(unmarshal_question, types.SimpleNamespace)
    assert unmarshal_question.id == "q-enc"
    assert unmarshal_question.question_index == 3
    assert unmarshal_question.question_text == "Do you smoke?"

    # JSON encodings
    assert isinstance(unmarshal_question.visible_condition, str)
    assert json.loads(unmarshal_question.visible_condition) == {
        "any": [{"field": "age", "gte": 18}]
    }

    assert isinstance(unmarshal_question.mc_options, str)
    assert json.loads(unmarshal_question.mc_options) == [
        {"mcId": 0, "opt": "Yes"},
        {"mcId": 1, "opt": "No"},
    ]

    assert isinstance(unmarshal_question.answers, str)
    assert json.loads(unmarshal_question.answers) == {"mcIdArray": [1]}

    # Lang versions are attached and individually encoded
    assert (
        hasattr(unmarshal_question, "lang_versions")
        and len(unmarshal_question.lang_versions) == 2
    )
    en_lv, fr_lv = unmarshal_question.lang_versions
    assert en_lv.lang == "en" and en_lv.question_text == "Do you smoke?"
    # The en mc_options were a list -> encoded string
    assert isinstance(en_lv.mc_options, str) and json.loads(en_lv.mc_options) == [
        "Yes",
        "No",
    ]
    assert fr_lv.lang == "fr" and fr_lv.question_text == "Fumez-vous?"
    # No mc_options key on fr_lv (not provided)
    assert not hasattr(fr_lv, "mc_options")

    # Schema-load assertions
    q_loads = schema_loads_by_model("QuestionOrm")
    assert q_loads, "Expected a schema.load(...) call for QuestionOrm"
    last_q_payload = q_loads[-1]
    # lang_versions must be removed before Question schema().load
    assert "lang_versions" not in last_q_payload
    # And the three fields must be strings by the time they hit schema.load
    assert isinstance(last_q_payload["visible_condition"], str)
    assert isinstance(last_q_payload["mc_options"], str)
    assert isinstance(last_q_payload["answers"], str)

    # Two lang-version schema loads should have occurred
    lv_loads = schema_loads_by_model("QuestionLangVersionOrm")
    assert len(lv_loads) == 2
    # The 'en' version mc_options should be an encoded string in the load payload
    en_lv_load = next(langs for langs in lv_loads if langs["lang"] == "en")
    assert isinstance(en_lv_load["mc_options"], str)
    assert json.loads(en_lv_load["mc_options"]) == ["Yes", "No"]
    # The 'fr' version should not carry mc_options at all
    fr_lv_load = next(langs for langs in lv_loads if langs["lang"] == "fr")
    assert "mc_options" not in fr_lv_load


def test_unmarshal_question_leaves_string_mc_options_and_handles_empty_versions(
    schema_loads_by_model,
):
    """
    Test that unmarshalling a QuestionOrm payload with pre-encoded mc_options and an empty lang_versions list
    - leaves the mc_options attribute as a JSON string
    - correctly handles the empty lang_versions list
    - schema.load payload checks
    """
    pre_encoded_mc = json.dumps(["mild", "severe"])
    payload = _question(
        id="q-pre",
        question_index=1,
        question_text="Dizziness severity?",
        question_type="MULTIPLE_CHOICE",
        mc_options=pre_encoded_mc,  # already a JSON string
        answers={"value": "mild"},  # dict -> encoded string
        lang_versions=[],  # empty list
    )

    unmarshal_question = unmarshal(QuestionOrm, payload)

    assert isinstance(unmarshal_question, types.SimpleNamespace)
    assert unmarshal_question.id == "q-pre"
    assert (
        isinstance(unmarshal_question.mc_options, str)
        and unmarshal_question.mc_options == pre_encoded_mc
    )  # unchanged
    assert isinstance(unmarshal_question.answers, str) and json.loads(
        unmarshal_question.answers
    ) == {"value": "mild"}
    assert (
        hasattr(unmarshal_question, "lang_versions")
        and unmarshal_question.lang_versions == []
    )

    # schema.load payload checks
    q_loads = schema_loads_by_model("QuestionOrm")
    last_q_payload = q_loads[-1]
    assert "lang_versions" not in last_q_payload
    assert last_q_payload["mc_options"] == pre_encoded_mc


def test_unmarshal_question_strips_none_fields_before_schema_load(
    schema_loads_by_model,
):
    """
    Test that unmarshalling a QuestionOrm payload strips away None fields before the
    schema.load call is made. This test verifies that the fields units, num_min, and
    num_max are not present in the schema.load payload, and that the fields
    question_type, visible_condition, and answers are present and were correctly
    encoded as needed.
    """
    payload = _question(
        id="q-none",
        question_index=2,
        question_text="Temperature?",
        question_type="NUMBER",
        units=None,  # should be stripped
        num_min=None,  # stripped
        num_max=None,  # stripped
        visible_condition={"all": []},
        answers={"number": 37.5},
    )

    _ = unmarshal(QuestionOrm, payload)

    q_loads = schema_loads_by_model("QuestionOrm")
    assert q_loads, "Expected a schema.load(...) call for QuestionOrm"
    last_payload = q_loads[-1]

    # None fields must not be present
    for k in ("units", "num_min", "num_max"):
        assert k not in last_payload

    # Provided fields made it through (and were encoded as needed)
    assert last_payload["question_type"] == "NUMBER"
    assert isinstance(last_payload["visible_condition"], str)
    assert isinstance(last_payload["answers"], str)
    assert json.loads(last_payload["answers"]) == {"number": 37.5}
