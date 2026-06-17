# ruff: noqa: SLF001
import data.orm_serializer as orm_seralizer
from models import (
    FormClassificationOrm,
    FormOrm,
    QuestionLangVersionOrm,
    QuestionOrm,
)


def make_classification(id_="form_classification-1"):
    """
    Construct a minimal FormClassificationOrm instance with the given id.

    :param id_: ID of the FormClassificationOrm to create.
    :return: Minimal FormClassificationOrm instance with the given id.
    """
    form_classification = FormClassificationOrm()
    form_classification.id = id_
    return form_classification


def make_question(
    *,
    id_="q-1",
    question_index=1,
    visible_condition='{"op":"always"}',
    mc_options='["Yes","No"]',
    answers='["Yes"]',
    lang_versions=None,
):
    """
    Construct a minimal QuestionOrm instance with the given parameters.

    :param id_: ID of the QuestionOrm to create.
    :param question_index: Index of the question in the form.
    :param visible_condition: Visible condition for the question.
    :param mc_options: Multiple choice options for the question.
    :param answers: Answers to the question.
    :param lang_versions: List of language versions for the question.
    :return: Minimal QuestionOrm instance with the given parameters.
    """
    question = QuestionOrm()
    question.id = id_
    question.question_index = question_index
    question.visible_condition = visible_condition
    question.mc_options = mc_options
    question.answers = answers
    if lang_versions is not None:
        question.lang_versions = lang_versions
    return question


def make_lang_version(
    *,
    id_=None,
    lang="en",
    question_text="How are you?",
    mc_options="[]",
):
    """
    Construct a minimal QuestionLangVersionOrm instance with the given parameters.

    :param id_: ID of the QuestionLangVersionOrm to create.
    :param lang: Language of the language version.
    :param question_text: Question text of the language version.
    :param mc_options: Multiple choice options for the language version.
    :return: Minimal QuestionLangVersionOrm instance with the given parameters.
    """
    question_lang_version = QuestionLangVersionOrm()
    if id_ is not None:
        question_lang_version.id = id_
    question_lang_version.lang = lang
    question_lang_version.question_text = question_text
    question_lang_version.mc_options = mc_options
    return question_lang_version


def make_form(
    *,
    id_="f-1",
    lang="en",
    name="ANC Intake",
    category="ANC",
    date_created=1_700_000_010,
    last_edited=1_700_000_099,
    archived=False,
    patient_id="p-123",
    form_template_id=None,
    last_edited_by=None,
    form_classification_id=None,
    classification=None,
    questions=None,
):
    """
    Construct a minimal FormOrm instance with the given parameters.

    :param id_: ID of the FormOrm to create.
    :param lang: Language of the form.
    :param name: Name of the form.
    :param category: Category of the form.
    :param date_created: Timestamp when the form was created.
    :param last_edited: Timestamp when the form was last edited.
    :param archived: Whether the form is archived.
    :param patient_id: ID of the patient associated with the form.
    :param form_template_id: ID of the form template associated with the form.
    :param last_edited_by: ID of the user who last edited the form.
    :param form_classification_id: ID of the form classification associated with the form.
    :param classification: FormClassificationOrm instance associated with the form.
    :param questions: List of QuestionOrm instances associated with the form.
    :return: Minimal FormOrm instance with the given parameters.
    """
    form = FormOrm()
    form.id = id_
    form.lang = lang
    form.name = name
    form.category = category
    form.date_created = date_created
    form.last_edited = last_edited
    form.archived = archived
    form.patient_id = patient_id
    form.form_template_id = form_template_id
    form.last_edited_by = last_edited_by
    form.form_classification_id = form_classification_id
    if classification is not None:
        form.classification = classification
    form.questions = questions or []
    return form


def test_form_shallow_includes_core_fields_and_classification_but_omits_questions_and_patient():
    """
    Shallow marshal should include core scalars and a compact classification,
    omit 'questions', and never leak 'patient'.
    It should also strip None-valued fk fields.
    """
    form_classification = make_classification("form_classification-shallow")
    form = make_form(
        id_="f-shallow",
        lang="fr",
        name="PNC Follow-up",
        category="PNC",
        date_created=1_700_100_000,
        last_edited=1_700_100_111,
        archived=True,
        patient_id="p-777",
        form_template_id=None,  # should be stripped
        last_edited_by=None,  # should be stripped
        form_classification_id="form_classification-shallow",
        classification=form_classification,
        questions=[make_question(id_="q-x", question_index=2)],
    )

    marshalled = orm_seralizer.marshal(form, shallow=True)

    # core scalar fields
    assert marshalled["id"] == "f-shallow"
    assert marshalled["lang"] == "fr"
    assert marshalled["name"] == "PNC Follow-up"
    assert marshalled["category"] == "PNC"
    assert marshalled["date_created"] == 1_700_100_000
    assert marshalled["last_edited"] == 1_700_100_111
    assert marshalled["archived"] is True
    assert marshalled["patient_id"] == "p-777"

    # classification embedded, minimally shaped (at least id)
    assert "classification" in marshalled and isinstance(
        marshalled["classification"], dict
    )
    assert marshalled["classification"]["id"] == "form_classification-shallow"

    # shallow: questions omitted
    assert "questions" not in marshalled

    # relationship cleanup: patient should not leak
    assert "patient" not in marshalled

    # None-valued fields must be stripped
    assert "form_template_id" not in marshalled
    assert "last_edited_by" not in marshalled


def test_form_deep_includes_sorted_questions_and_parses_question_fields():
    """
    Deep marshal should:
    - include questions sorted by question_index ascending
    - parse visible_condition (dict), mc_options (list), answers (list)
    - not leak question relationship fields (form/form_template/category_question)
    """
    form_classification = make_classification("form_classification-deep")
    q2 = make_question(
        id_="q-2",
        question_index=2,
        visible_condition='{"op":"never"}',
        mc_options="[]",
        answers="[]",
    )
    q1 = make_question(
        id_="q-1",
        question_index=1,
        visible_condition='{"op":"and","rules":[]}',
        mc_options='["A","B"]',
        answers='["B"]',
    )
    form = make_form(
        id_="f-deep",
        classification=form_classification,
        questions=[q2, q1],  # deliberately unsorted on input
    )

    marshalled = orm_seralizer.marshal(form, shallow=False)

    assert "questions" in marshalled and isinstance(marshalled["questions"], list)
    idxs = [q["question_index"] for q in marshalled["questions"]]
    assert idxs == [1, 2], "questions must be sorted ascending by question_index"

    # First question should be q1 (index 1)
    first = marshalled["questions"][0]
    assert first["id"] == "q-1"
    assert isinstance(first["visible_condition"], dict)
    assert isinstance(first["mc_options"], list)
    assert isinstance(first["answers"], list)

    # Ensure relationship fields are not leaked from each question
    for qo in marshalled["questions"]:
        assert "form" not in qo
        assert "form_template" not in qo
        assert "category_question" not in qo


def test_form_deep_does_not_mutate_source_objects_and_strips_privates_everywhere():
    """
    Marshal should not mutate the source objects (e.g., not resort the original
    questions list) and must strip private attributes from form, classification, and questions.
    """
    form_classification = make_classification("form_classification-priv")
    qA = make_question(id_="q-A", question_index=3)
    qB = make_question(id_="q-B", question_index=1)
    qC = make_question(id_="q-C", question_index=2)
    form = make_form(
        id_="f-priv", classification=form_classification, questions=[qA, qB, qC]
    )

    # Add private attrs that must be stripped
    form._secret = "nope"
    form_classification._hidden = True
    qA._debug = {"x": 1}

    # Snapshot original question order to prove non-mutation
    original_order = [question.id for question in form.questions]

    marshalled = orm_seralizer.marshal(form, shallow=False)

    # Private attributes shouldn't appear
    assert "_secret" not in marshalled
    assert "_hidden" not in marshalled.get("classification", {})
    assert "_debug" not in marshalled["questions"][0]  # check any representative elem
    for qo in marshalled["questions"]:
        for k in qo:
            assert not k.startswith("_")

    assert [question.id for question in form.questions] == original_order


def test_form_classification_backrefs_do_not_leak_templates():
    """
    The classification payload should not include 'templates' backreform.
    (marshal_form_classification explicitly removes it.)
    """
    form_classification = make_classification("form_classification-noleak")
    form = make_form(id_="f-noleak", classification=form_classification)

    marshalled = orm_seralizer.marshal(form, shallow=True)
    assert "templates" not in marshalled["classification"]


def test_form_marshal_with_type_uses_shallow_and_sets_type():
    """
    marshal_with_type(form) should:
    - use shallow form marshaling (questions omitted),
    - inject 'type': 'form'.
    """
    form_classification = make_classification("form_classification-type")
    form = make_form(
        id_="f-type",
        classification=form_classification,
        questions=[make_question(id_="q-1", question_index=1)],
    )

    marshalled = orm_seralizer.marshal_with_type(form, shallow=False)

    assert marshalled["type"] == "form"
    assert marshalled["id"] == "f-type"
    assert "questions" not in marshalled
    assert (
        "classification" in marshalled
        and marshalled["classification"]["id"] == "form_classification-type"
    )
