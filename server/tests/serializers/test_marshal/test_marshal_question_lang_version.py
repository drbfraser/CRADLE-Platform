# ruff: noqa: SLF001
from data import marshal as m
from enums import QuestionTypeEnum
from models import (
    QuestionLangVersionOrm,
    QuestionOrm,
)


def make_lang_version(
    *,
    id_=42,
    lang="fr",
    question_text="Tension artérielle - diastolique 🫀",
    mc_options='["Normal","Medium","High"]',
    question_id="q-abc",
    attach_question=False,
):
    v = QuestionLangVersionOrm()
    v.id = id_
    v.lang = lang
    v.question_text = question_text
    v.mc_options = mc_options
    v.question_id = question_id

    if attach_question:
        q = QuestionOrm()
        q.id = question_id
        q.is_blank = False
        q.question_index = 1
        q.question_text = "Diastolic BP"
        q.question_type = QuestionTypeEnum.INTEGER
        q.visible_condition = "[]"
        q.mc_options = "[]"
        q.answers = "{}"
        v.question = q

    return v


def test_lang_version_marshal_parses_mc_options_and_strips_relationships_and_privates():
    """
    marshal(QuestionLangVersionOrm) should:
      - parse mc_options JSON string into a Python list,
      - keep core scalars (id, lang, question_text, question_id),
      - strip the relationship object 'question' if present,
      - drop private attributes (starting with '_').
    """
    v = make_lang_version(
        id_=101,
        lang="en",
        question_text="Blood pressure - diastolic",
        mc_options='["High","Normal","Low"]',
        question_id="q-bp-dia",
        attach_question=True,
    )

    v._debug = {"trace": True}
    v.extra = None

    out = m.marshal(v)

    # Core scalar fields preserved
    assert out["id"] == 101
    assert out["lang"] == "en"
    assert out["question_text"] == "Blood pressure - diastolic"
    assert out["question_id"] == "q-bp-dia"

    # mc_options parsed to list
    assert isinstance(out["mc_options"], list)
    assert out["mc_options"] == ["High", "Normal", "Low"]

    # Relationship stripped
    assert "question" not in out

    # Private + None-valued stripped
    assert "_debug" not in out
    assert "extra" not in out
    assert all(not k.startswith("_") for k in out)


def test_lang_version_marshal_omits_default_empty_mc_options():
    """
    When mc_options is the default string "[]", the marshaler should omit the field entirely.
    """
    v = make_lang_version(
        id_=202,
        lang="rw",
        question_text="test test test",
        mc_options="[]",
        question_id="q-bp",
    )

    out = m.marshal(v)

    assert out["id"] == 202
    assert out["lang"] == "rw"
    assert out["question_text"] == "test test test"
    assert out["question_id"] == "q-bp"

    # Default "[]": field removed
    assert "mc_options" not in out


def test_lang_version_integration_when_embedded_in_question():
    """
    Integration sanity check: when a QuestionOrm includes lang_versions and we marshal the
    Question with if_include_versions=True, the embedded versions follow the same rules:
      - non-empty mc_options parsed,
      - default "[]": mc_options omitted,
      - relationship to the Question itself is not leaked.
    Also ensure the Question's own JSON-string fields are present so the marshaler
    can parse them (we're not flushing to DB, so SQLAlchemy defaults aren't applied).
    """
    # Create a question and attach two language versions
    q = QuestionOrm()
    q.id = "q-int"
    q.is_blank = False
    q.question_index = 3
    q.question_text = "BP (base)"
    q.question_type = QuestionTypeEnum.MULTIPLE_CHOICE

    # Provide JSON-string defaults expected by __marshal_question
    q.visible_condition = "[]"
    q.mc_options = "[]"
    q.answers = "{}"

    lv_en = make_lang_version(
        id_=301,
        lang="en",
        question_text="Blood pressure",
        mc_options='["High","Normal","Low"]',
        question_id=q.id,
        attach_question=True,
    )
    lv_fr = make_lang_version(
        id_=302,
        lang="fr",
        question_text="Tension artérielle",
        mc_options="[]",  # should be omitted when marshaled
        question_id=q.id,
        attach_question=True,
    )
    q.lang_versions = [lv_en, lv_fr]

    out = m.marshal(q, if_include_versions=True)

    # Question-level parsed JSON fields exist and are parsed
    assert out["visible_condition"] == []
    assert out["mc_options"] == []
    assert out["answers"] == {}

    assert "lang_versions" in out and isinstance(out["lang_versions"], list)
    assert {v["lang"] for v in out["lang_versions"]} == {"en", "fr"}

    en = next(v for v in out["lang_versions"] if v["lang"] == "en")
    assert en["id"] == 301
    assert en["question_text"] == "Blood pressure"
    assert en["question_id"] == "q-int"
    assert en["mc_options"] == ["High", "Normal", "Low"]
    assert "question" not in en

    fr = next(v for v in out["lang_versions"] if v["lang"] == "fr")
    assert fr["id"] == 302
    assert fr["question_text"] == "Tension artérielle"
    assert fr["question_id"] == "q-int"

    assert "mc_options" not in fr
    assert "question" not in fr
