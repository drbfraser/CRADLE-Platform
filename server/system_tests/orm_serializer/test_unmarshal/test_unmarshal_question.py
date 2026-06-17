from __future__ import annotations

import json

from data import orm_serializer
from models import QuestionOrm
from tests.helpers import make_question, make_question_lang_version


def test_unmarshal_question_encodes_json_fields_and_detaches_lang_versions():
    """
    Test that unmarshalling a question payload with visible condition, mc options and
    answers fields correctly encodes these fields and detaches the lang versions.
    """
    qid = "q-enc"
    payload = make_question(
        id=qid,
        question_index=3,
        question_text="Do you smoke?",
        question_type="MULTIPLE_CHOICE",
        visible_condition={"any": [{"field": "age", "gte": 18}]},
        mc_options=[{"mcId": 0, "opt": "Yes"}, {"mcId": 1, "opt": "No"}],
        answers={"mcIdArray": [1]},
        lang_versions=[
            make_question_lang_version(
                lang="en",
                question_text="Do you smoke?",
                mc_options=["Yes", "No"],
                question_id=qid,
            ),
            make_question_lang_version(
                lang="fr", question_text="Fumez-vous?", question_id=qid
            ),
        ],
    )

    obj = orm_serializer.unmarshal(QuestionOrm, payload)

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
    payload = make_question(
        id="q-pre",
        question_index=1,
        question_text="Dizziness severity?",
        question_type="MULTIPLE_CHOICE",
        mc_options=pre_encoded_mc,
        answers={"value": "mild"},
        lang_versions=[],
    )

    obj = orm_serializer.unmarshal(QuestionOrm, payload)

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
    payload = make_question(
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

    obj = orm_serializer.unmarshal(QuestionOrm, payload)

    assert isinstance(obj, QuestionOrm)
    assert obj.question_type == "DECIMAL"

    for k in ("units", "num_min", "num_max"):
        assert not hasattr(obj, k) or getattr(obj, k) is None

    assert isinstance(obj.visible_condition, str)
    assert isinstance(obj.answers, str)
    assert json.loads(obj.answers) == {"number": 37.5}
