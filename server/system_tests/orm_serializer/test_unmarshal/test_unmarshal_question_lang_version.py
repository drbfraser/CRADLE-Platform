from __future__ import annotations

import json
from typing import Any

from data.marshal import unmarshal
from models import QuestionLangVersionOrm


def _create_lang_version(
    *,
    id: int | None = None,
    lang: str = "en",
    question_text: str = "How are you?",
    mc_options: list[str] | str | None = None,
    question_id: str = "q-001",
    **extras: Any,
) -> dict:
    d: dict[str, Any] = {
        "lang": lang,
        "question_text": question_text,
        "question_id": question_id,
        **extras,
    }
    if id is not None:
        d["id"] = id
    if mc_options is not None:
        d["mc_options"] = mc_options
    return d


def test_unmarshal_lang_version_encodes_list_mc_options_to_json_string():
    """
    Verify that unmarshalling a QuestionLangVersionOrm from a dictionary payload with
    a list of multiple choice options will result in a JSON string being passed
    to schema().load(...), and that the unmarshalled object has the same semantic content
    as the original payload.
    """
    payload = _create_lang_version(
        id=10,
        lang="fr",
        question_text="Ça va ?",
        mc_options=["bien", "mal"],
        question_id="q-abc",
    )

    lv = unmarshal(QuestionLangVersionOrm, payload)

    assert lv.lang == "fr"
    assert lv.question_text == "Ça va ?"
    assert lv.question_id == "q-abc"

    assert isinstance(lv.mc_options, str)
    assert set(json.loads(lv.mc_options)) == {"bien", "mal"}


def test_unmarshal_lang_version_leaves_json_string_mc_options_unchanged():
    """
    Verify that unmarshalling a QuestionLangVersionOrm from a dictionary payload with
    a JSON string of multiple choice options will result in the same JSON string being
    passed to schema().load(...).
    """
    payload = _create_lang_version(
        id=11,
        lang="en",
        question_text="Pick one",
        mc_options='["yes","no"]',
        question_id="q-111",
    )

    lv = unmarshal(QuestionLangVersionOrm, payload)

    assert lv.lang == "en"
    assert lv.question_text == "Pick one"
    assert lv.question_id == "q-111"

    assert isinstance(lv.mc_options, str)
    assert json.loads(lv.mc_options) == ["yes", "no"]


def test_unmarshal_lang_version_omits_mc_options_when_absent():
    """
    Verify that unmarshalling a QuestionLangVersionOrm from a dictionary payload with a
    missing 'mc_options' key results in a None value for the mc_options field of the
    returned object.
    """
    payload = _create_lang_version(
        lang="sw", question_text="Habari?", question_id="q-222"
    )

    lv = unmarshal(QuestionLangVersionOrm, payload)

    assert lv.lang == "sw"
    assert lv.question_text == "Habari?"
    assert lv.question_id == "q-222"
    assert getattr(lv.mc_options, "mc_options", None) is None
