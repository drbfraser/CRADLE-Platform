from __future__ import annotations

import types
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
    """
    Construct a minimal dictionary representing a QuestionLangVersionOrm instance with the given parameters.

    :param id: ID of the QuestionLangVersionOrm to create.
    :param lang: Language of the language version.
    :param question_text: Question text of the language version.
    :param mc_options: Multiple choice options for the language version.
    :param question_id: ID of the parent Question.
    :param **extras: Any additional key-value pairs to be included in the language version dictionary.
    :return: Minimal dictionary representing the language version with the given parameters.
    """
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


def test_unmarshal_lang_version_encodes_list_mc_options_to_json_string(
    schema_loads_by_model,
):
    """
    Verify that unmarshalling a QuestionLangVersionOrm from a dictionary payload with
    a list of multiple choice options will result in a JSON string being passed
    to schema().load(...).
    """
    payload = _create_lang_version(
        id=10,
        lang="fr",
        question_text="Ça va ?",
        mc_options=["bien", "mal"],
        question_id="q-abc",
    )

    lv = unmarshal(QuestionLangVersionOrm, payload)

    # Returned object is the stub (SimpleNamespace) from the schema stub
    assert isinstance(lv, types.SimpleNamespace)
    assert lv.lang == "fr"
    assert lv.question_text == "Ça va ?"
    assert lv.question_id == "q-abc"

    # Confirm what hit schema().load(...)
    loads = schema_loads_by_model("QuestionLangVersionOrm")
    assert loads, "Expected a schema.load(...) call for QuestionLangVersionOrm"
    last = loads[-1]

    # mc_options must be a JSON string in the schema payload (list -> string)
    assert last["lang"] == "fr"
    assert last["question_text"] == "Ça va ?"
    assert last["question_id"] == "q-abc"
    # should be a string, not list
    assert isinstance(last["mc_options"], str)
    assert last["mc_options"] in ('["bien", "mal"]', '["mal", "bien"]')


def test_unmarshal_lang_version_leaves_json_string_mc_options_unchanged(
    schema_loads_by_model,
):
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

    _ = unmarshal(QuestionLangVersionOrm, payload)

    loads = schema_loads_by_model("QuestionLangVersionOrm")
    assert loads, "Expected a schema.load(...) call for QuestionLangVersionOrm"
    last = loads[-1]
    assert last["lang"] == "en"
    assert last["question_text"] == "Pick one"
    assert last["question_id"] == "q-111"
    assert last["mc_options"] == '["yes","no"]'  # unchanged


def test_unmarshal_lang_version_omits_mc_options_when_absent(schema_loads_by_model):
    """
    If mc_options is omitted from the payload entirely, __unmarshal_lang_version
    should call schema().load(...) without an 'mc_options' key.
    """
    payload = _create_lang_version(
        lang="sw", question_text="Habari?", question_id="q-222"
    )
    _ = unmarshal(QuestionLangVersionOrm, payload)

    loads = schema_loads_by_model("QuestionLangVersionOrm")
    assert loads, "Expected a schema.load(...) call for QuestionLangVersionOrm"
    last = loads[-1]
    assert "mc_options" not in last
    assert last["lang"] == "sw"
    assert last["question_text"] == "Habari?"
    assert last["question_id"] == "q-222"
