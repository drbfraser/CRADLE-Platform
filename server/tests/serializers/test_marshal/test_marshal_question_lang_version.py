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
    """
    Construct a minimal QuestionLangVersionOrm instance with the given parameters.

    :param id_: ID of the QuestionLangVersionOrm to create.
    :param lang: Language of the language version.
    :param question_text: Question text of the language version.
    :param mc_options: Multiple choice options for the language version.
    :param question_id: ID of the parent Question.
    :param attach_question: Whether to create a parent Question and attach it.
    :return: Minimal QuestionLangVersionOrm instance with the given parameters.
    """
    question_lang_version = QuestionLangVersionOrm()
    question_lang_version.id = id_
    question_lang_version.lang = lang
    question_lang_version.question_text = question_text
    question_lang_version.mc_options = mc_options
    question_lang_version.question_id = question_id

    if attach_question:
        question = QuestionOrm()
        question.id = question_id
        question.is_blank = False
        question.question_index = 1
        question.question_text = "Diastolic BP"
        question.question_type = QuestionTypeEnum.INTEGER
        question.visible_condition = "[]"
        question.mc_options = "[]"
        question.answers = "{}"
        question_lang_version.question = question

    return question_lang_version


def test_lang_version_marshal_parses_mc_options_and_strips_relationships_and_privates():
    """
    marshal(QuestionLangVersionOrm) should:
      - parse mc_options JSON string into a Python list,
      - keep core scalars (id, lang, question_text, question_id),
      - strip the relationship object 'question' if present,
      - drop private attributes (starting with '_').
    """
    question_lang_version = make_lang_version(
        id_=101,
        lang="en",
        question_text="Blood pressure - diastolic",
        mc_options='["High","Normal","Low"]',
        question_id="q-bp-dia",
        attach_question=True,
    )

    question_lang_version._debug = {"trace": True}
    question_lang_version.extra = None

    marshalled = m.marshal(question_lang_version)

    # Core scalar fields preserved
    assert marshalled["id"] == 101
    assert marshalled["lang"] == "en"
    assert marshalled["question_text"] == "Blood pressure - diastolic"
    assert marshalled["question_id"] == "q-bp-dia"

    # mc_options parsed to list
    assert isinstance(marshalled["mc_options"], list)
    assert marshalled["mc_options"] == ["High", "Normal", "Low"]

    # Relationship stripped
    assert "question" not in marshalled

    # Private + None-valued stripped
    assert "_debug" not in marshalled
    assert "extra" not in marshalled
    assert all(not k.startswith("_") for k in marshalled)


def test_lang_version_marshal_omits_default_empty_mc_options():
    """
    When mc_options is the default string "[]", the marshaler should omit the field entirely.
    """
    question_lang_version = make_lang_version(
        id_=202,
        lang="rw",
        question_text="test test test",
        mc_options="[]",
        question_id="q-bp",
    )

    marshalled = m.marshal(question_lang_version)

    assert marshalled["id"] == 202
    assert marshalled["lang"] == "rw"
    assert marshalled["question_text"] == "test test test"
    assert marshalled["question_id"] == "q-bp"

    # Default "[]": field removed
    assert "mc_options" not in marshalled


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
    question = QuestionOrm()
    question.id = "q-int"
    question.is_blank = False
    question.question_index = 3
    question.question_text = "BP (base)"
    question.question_type = QuestionTypeEnum.MULTIPLE_CHOICE

    # Provide JSON-string defaults expected by __marshal_question
    question.visible_condition = "[]"
    question.mc_options = "[]"
    question.answers = "{}"

    lv_en = make_lang_version(
        id_=301,
        lang="en",
        question_text="Blood pressure",
        mc_options='["High","Normal","Low"]',
        question_id=question.id,
        attach_question=True,
    )
    lv_fr = make_lang_version(
        id_=302,
        lang="fr",
        question_text="Tension artérielle",
        mc_options="[]",  # should be omitted when marshaled
        question_id=question.id,
        attach_question=True,
    )
    question.lang_versions = [lv_en, lv_fr]

    marshalled = m.marshal(question, if_include_versions=True)

    # Question-level parsed JSON fields exist and are parsed
    assert marshalled["visible_condition"] == []
    assert marshalled["mc_options"] == []
    assert marshalled["answers"] == {}

    assert "lang_versions" in marshalled and isinstance(
        marshalled["lang_versions"], list
    )
    assert {v["lang"] for v in marshalled["lang_versions"]} == {"en", "fr"}

    en = next(v for v in marshalled["lang_versions"] if v["lang"] == "en")
    assert en["id"] == 301
    assert en["question_text"] == "Blood pressure"
    assert en["question_id"] == "q-int"
    assert en["mc_options"] == ["High", "Normal", "Low"]
    assert "question" not in en

    fr = next(v for v in marshalled["lang_versions"] if v["lang"] == "fr")
    assert fr["id"] == 302
    assert fr["question_text"] == "Tension artérielle"
    assert fr["question_id"] == "q-int"

    assert "mc_options" not in fr
    assert "question" not in fr
