from data import orm_serializer
from tests.helpers import (
    make_form_template_orm,
    make_question_lang_version_orm,
    make_question_orm,
)


def test_marshal_template_to_single_version_sets_lang_and_sorts_questions():
    """
    Test that marshal_template_to_single_version sets the "lang" field and sorts the returned
    questions by their "question_index" field in ascending order.
    """
    template = make_form_template_orm(id="tmpl-1", name="ANC Template")

    q2 = make_question_orm(
        question_index=2,
        question_text="Base Q2",
        mc_options=["baseQ2-1", "baseQ2-2"],
        form_template=template,
    )
    make_question_lang_version_orm(
        lang="en",
        question_text="EN Q2",
        mc_options=["en-Q2-1", "en-Q2-2"],
        question=q2,
    )

    q0 = make_question_orm(
        question_index=0,
        question_text="Base Q0",
        mc_options=["baseQ0-1"],
        form_template=template,
    )
    make_question_lang_version_orm(
        lang="en",
        question_text="EN Q0",
        mc_options=["en-Q0-1", "en-Q0-2"],
        question=q0,
    )

    result = orm_serializer.marshal_template_to_single_version(template, version="en")

    assert result["lang"] == "en"

    questions = result["questions"]
    assert len(questions) == 2
    assert [q["question_index"] for q in questions] == [0, 2]

    assert questions[0]["question_text"] == "EN Q0"
    assert questions[0]["mc_options"] == ["en-Q0-1", "en-Q0-2"]

    assert questions[1]["question_text"] == "EN Q2"
    assert questions[1]["mc_options"] == ["en-Q2-1", "en-Q2-2"]


def test_marshal_template_to_single_version_falls_back_when_lang_missing():
    """
    Test that marshal_template_to_single_version falls back to the base language when the
    requested version is not present in the template's questions.
    """
    template = make_form_template_orm(id="tmpl-no-en", name="No EN Template")

    q = make_question_orm(
        question_index=1,
        question_text="Base text (default language)",
        mc_options=["base-1", "base-2"],
        form_template=template,
    )

    make_question_lang_version_orm(
        lang="fr",
        question_text="Texte en français",
        mc_options=["fr-1", "fr-2"],
        question=q,
    )

    result = orm_serializer.marshal_template_to_single_version(template, version="en")

    questions = result["questions"]
    assert len(questions) == 1

    q_dict = questions[0]
    assert q_dict["question_index"] == 1
    assert q_dict["question_text"] == "Base text (default language)"
    assert q_dict["mc_options"] == ["base-1", "base-2"]


def test_marshal_template_to_single_version_overrides_mc_options_from_lang_version():
    """
    Test that marshal_template_to_single_version overrides the mc_options from the base question
    with the mc_options from the lang version when present.
    """
    template = make_form_template_orm(id="tmpl-mc", name="MC Override Template")

    q = make_question_orm(
        question_index=5,
        question_text="Base MC question",
        mc_options=["base-opt"],
        form_template=template,
    )

    make_question_lang_version_orm(
        lang="en",
        question_text="EN MC question",
        mc_options=["en-opt1", "en-opt2"],
        question=q,
    )

    result = orm_serializer.marshal_template_to_single_version(template, version="en")

    questions = result["questions"]
    assert len(questions) == 1

    q_dict = questions[0]
    assert q_dict["question_index"] == 5
    assert q_dict["question_text"] == "EN MC question"
    assert q_dict["mc_options"] == ["en-opt1", "en-opt2"]


def test_marshal_template_to_single_version_with_no_questions_returns_empty_list():
    """
    Test that marshal_template_to_single_version returns an empty list for the "questions"
    key when the input FormTemplateOrm has no questions.
    """
    template = make_form_template_orm(
        id="tmpl-empty",
        name="Empty Template",
        questions=[],
    )

    result = orm_serializer.marshal_template_to_single_version(template, version="en")

    assert result["lang"] == "en"
    assert "questions" in result
    assert result["questions"] == []
