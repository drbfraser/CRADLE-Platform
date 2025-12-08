from data.orm_serializer import marshal_question_to_single_version
from tests.helpers import make_question_lang_version_orm, make_question_orm


def test_marshal_question_to_single_version_no_versions_returns_base():
    """
    Test that marshal_question_to_single_version returns the base question's text and mc_options when no lang_versions are present.
    """
    q = make_question_orm(
        question_index=3,
        question_text="Base question text",
        mc_options=["base-opt-1", "base-opt-2"],
    )

    result = marshal_question_to_single_version(q, lang="en")

    assert result["question_index"] == 3
    assert result["question_text"] == "Base question text"
    assert result["mc_options"] == ["base-opt-1", "base-opt-2"]


def test_marshal_question_to_single_version_overrides_text_and_mc_options_for_matching_lang():
    """
    Test that marshal_question_to_single_version overrides the base question's text and mc_options
    with the text and mc_options from the lang version when the requested lang matches one of
    the lang_versions attached to the question.
    """
    q = make_question_orm(
        question_index=1,
        question_text="Base text",
        mc_options=["base-1", "base-2"],
    )

    make_question_lang_version_orm(
        lang="en",
        question_text="English text",
        mc_options=["en-1", "en-2"],
        question=q,
    )

    result = marshal_question_to_single_version(q, lang="en")

    assert result["question_index"] == 1
    assert result["question_text"] == "English text"
    assert result["mc_options"] == ["en-1", "en-2"]


def test_marshal_question_to_single_version_overrides_text_only_when_mc_options_empty_array():
    """
    Test that marshal_question_to_single_version overrides the base question's text with the version's
    text when the version's mc_options is an empty array, but leaves the base question's mc_options
    unchanged.
    """
    q = make_question_orm(
        question_index=2,
        question_text="Base text",
        mc_options=["base-opt"],
    )

    make_question_lang_version_orm(
        lang="en",
        question_text="EN text only",
        mc_options="[]",
        question=q,
    )

    result = marshal_question_to_single_version(q, lang="en")

    assert result["question_index"] == 2
    assert result["question_text"] == "EN text only"
    assert result["mc_options"] == ["base-opt"]


def test_marshal_question_to_single_version_falls_back_to_base_when_lang_missing():
    """
    Test that marshal_question_to_single_version falls back to the base question's text and mc_options
    when the requested version is not present in the template's questions.
    """
    q = make_question_orm(
        question_index=4,
        question_text="Base text",
        mc_options=["base-a", "base-b"],
    )

    make_question_lang_version_orm(
        lang="fr",
        question_text="Texte français",
        mc_options=["fr-1", "fr-2"],
        question=q,
    )

    result = marshal_question_to_single_version(q, lang="en")

    assert result["question_index"] == 4
    assert result["question_text"] == "Base text"
    assert result["mc_options"] == ["base-a", "base-b"]


def test_marshal_question_to_single_version_keeps_base_mc_options_on_invalid_json():
    """
    Test that marshal_question_to_single_version keeps the base question's mc_options when
    the lang version's mc_options JSON string is invalid.
    """
    q = make_question_orm(
        question_index=5,
        question_text="Base question",
        mc_options=["base-opt-1"],
    )

    make_question_lang_version_orm(
        lang="en",
        question_text="Text with bad mc_options",
        mc_options="not-valid-json",
        question=q,
    )

    result = marshal_question_to_single_version(q, lang="en")

    assert result["question_index"] == 5
    assert result["question_text"] == "Text with bad mc_options"
    assert result["mc_options"] == ["base-opt-1"]
