from __future__ import annotations

import json
from typing import Any

from data.marshal import unmarshal
from models import QuestionOrm


def _lang_version(
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


def test_unmarshal_question_encodes_json_fields_and_detaches_lang_versions():
    """
    Test that unmarshalling a question payload with visible condition, mc options and
    answers fields correctly encodes these fields and detaches the lang versions.
    """
    qid = "q-enc"
    payload = _question(
        id=qid,
        question_index=3,
        question_text="Do you smoke?",
        question_type="MULTIPLE_CHOICE",
        visible_condition={"any": [{"field": "age", "gte": 18}]},
        mc_options=[{"mcId": 0, "opt": "Yes"}, {"mcId": 1, "opt": "No"}],
        answers={"mcIdArray": [1]},
        lang_versions=[
            _lang_version(
                lang="en",
                question_text="Do you smoke?",
                mc_options=["Yes", "No"],
                question_id=qid,
            ),
            _lang_version(lang="fr", question_text="Fumez-vous?", question_id=qid),
        ],
    )

    obj = unmarshal(QuestionOrm, payload)

    assert isinstance(obj, QuestionOrm)
    assert obj.id == "q-enc"
    assert obj.question_index == 3
    assert obj.question_text == "Do you smoke?"

    assert isinstance(obj.visible_condition, str)
    assert json.loads(obj.visible_condition) == {"any": [{"field": "age", "gte": 18}]}

    assert isinstance(obj.mc_options, str)
    assert json.loads(obj.mc_options) == [
        {"mcId": 0, "opt": "Yes"},
        {"mcId": 1, "opt": "No"},
    ]

    assert isinstance(obj.answers, str)
    assert json.loads(obj.answers) == {"mcIdArray": [1]}

    assert hasattr(obj, "lang_versions") and len(obj.lang_versions) == 2
    en_lv, fr_lv = obj.lang_versions

    assert en_lv.lang == "en" and en_lv.question_text == "Do you smoke?"
    assert isinstance(en_lv.mc_options, str)
    assert json.loads(en_lv.mc_options) == ["Yes", "No"]

    assert fr_lv.lang == "fr" and fr_lv.question_text == "Fumez-vous?"
    val = getattr(fr_lv, "mc_options", None)
    assert (val is None) or (isinstance(val, str) and json.loads(val) == [])


def test_unmarshal_question_leaves_string_mc_options_and_handles_empty_versions():
    """
    Test that unmarshalling a QuestionOrm payload with pre-encoded mc_options and an empty lang_versions list
    - leaves the mc_options attribute as a JSON string
    - correctly handles the empty lang_versions list
    """
    pre_encoded_mc = json.dumps(["mild", "severe"])
    payload = _question(
        id="q-pre",
        question_index=1,
        question_text="Dizziness severity?",
        question_type="MULTIPLE_CHOICE",
        mc_options=pre_encoded_mc,
        answers={"value": "mild"},
        lang_versions=[],
    )

    obj = unmarshal(QuestionOrm, payload)

    assert isinstance(obj, QuestionOrm)
    assert obj.id == "q-pre"
    assert isinstance(obj.mc_options, str) and obj.mc_options == pre_encoded_mc
    assert isinstance(obj.answers, str) and json.loads(obj.answers) == {"value": "mild"}
    assert hasattr(obj, "lang_versions") and obj.lang_versions == []


def test_unmarshal_question_strips_or_ignores_none_fields_and_encodes_other_fields():
    """
    Test that unmarshalling a QuestionOrm payload with None fields strips or ignores these fields, and
    JSON-encodes other fields correctly.
    """
    payload = _question(
        id="q-none",
        question_index=2,
        question_text="Temperature?",
        question_type="DECIMAL",
        units=None,
        num_min=None,
        num_max=None,
        visible_condition={"all": []},
        answers={"number": 37.5},
    )

    obj = unmarshal(QuestionOrm, payload)

    assert isinstance(obj, QuestionOrm)
    assert obj.question_type == "DECIMAL"

    for k in ("units", "num_min", "num_max"):
        assert not hasattr(obj, k) or getattr(obj, k) is None

    assert isinstance(obj.visible_condition, str)
    assert isinstance(obj.answers, str)
    assert json.loads(obj.answers) == {"number": 37.5}
