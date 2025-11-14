# ruff: noqa: SLF001
from __future__ import annotations

from data import marshal as m
from models import (
    FormClassificationOrm,
    FormClassificationOrmV2,
    FormTemplateOrm,
    FormTemplateOrmV2,
    QuestionLangVersionOrm,
    QuestionOrm,
)


def make_classification(id_="fc-1"):
    """
    Construct a minimal FormClassificationOrm instance with the given id.

    :param id_: ID of the FormClassificationOrm to create.
    :return: Minimal FormClassificationOrm instance with the given id.
    """
    form_lassification = FormClassificationOrm()
    form_lassification.id = id_
    return form_lassification


def make_question(
    *,
    id_="q-1",
    question_index=1,
    visible_condition='{"op":"always"}',
    mc_options='["Yes","No"]',
    answers="[]",
    lang_versions: list[QuestionLangVersionOrm] | None = None,
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
    lang_version = QuestionLangVersionOrm()
    if id_ is not None:
        lang_version.id = id_
    lang_version.lang = lang
    lang_version.question_text = question_text
    lang_version.mc_options = mc_options
    return lang_version


def make_form_template(
    *,
    id_="ft-1",
    version="v1",
    date_created=1_577_836_800,  # 2020-01-01
    archived=False,
    classification: FormClassificationOrm | None = None,
    questions: list[QuestionOrm] | None = None,
):
    """
    Construct a minimal FormTemplateOrm instance with the given parameters.

    :param id_: ID of the FormTemplateOrm to create.
    :param version: Version of the form template.
    :param date_created: Timestamp when the form template was created.
    :param archived: Whether the form template is archived.
    :param classification: FormClassificationOrm instance associated with the form template.
    :param questions: List of QuestionOrm instances associated with the form template.
    :return: Minimal FormTemplateOrm instance with the given parameters.
    """
    form_template = FormTemplateOrm()
    form_template.id = id_
    form_template.version = version
    form_template.date_created = date_created
    form_template.archived = archived
    if classification:
        form_template.classification = classification
    # Ensure the relationship is materialized in __dict__ before marshaling
    form_template.questions = questions or []
    return form_template


def test_form_template_shallow_omits_questions_and_embeds_classification():
    """
    Shallow marshal should:
    - include core scalar fields,
    - include a compact classification dict,
    - omit nested 'questions'.
    """
    form_classification = make_classification("fc-11")
    question_1 = make_question(id_="q-9", question_index=2)
    question_2 = make_question(id_="q-3", question_index=1)
    form_template = make_form_template(
        id_="ft-9",
        version="v9",
        date_created=1700000000,
        archived=True,
        classification=form_classification,
        questions=[question_1, question_2],
    )

    marshalled = m.marshal(form_template, shallow=True)

    assert marshalled["id"] == "ft-9"
    assert marshalled["version"] == "v9"
    assert marshalled["date_created"] == 1700000000
    assert marshalled["archived"] is True

    assert "classification" in marshalled
    assert isinstance(marshalled["classification"], dict)
    assert marshalled["classification"]["id"] == "fc-11"

    # No questions when shallow=True
    assert "questions" not in marshalled


def test_form_template_deep_includes_sorted_questions_and_parses_fields():
    """
    Deep marshal should include questions:
    - sorted by question_index ascending,
    - with JSON fields parsed (visible_condition -> dict, mc_options -> list, answers -> list).
    """
    form_classification = make_classification("fc-22")
    question_1 = make_question(
        id_="q-a",
        question_index=3,
        visible_condition='{"op":"and","rules":[]}',
        mc_options='["A","B"]',
        answers='["B"]',
    )
    question_2 = make_question(
        id_="q-b",
        question_index=1,
        visible_condition='{"op":"always"}',
        mc_options='["X"]',
        answers="[]",
    )
    question_3 = make_question(
        id_="q-c",
        question_index=2,
        visible_condition='{"op":"never"}',
        mc_options="[]",
        answers="[]",
    )

    # Deliberately unsorted input
    form_template = make_form_template(
        id_="ft-deep",
        classification=form_classification,
        questions=[question_1, question_2, question_3],
    )

    marshalled = m.marshal(form_template, shallow=False)

    assert "questions" in marshalled and isinstance(marshalled["questions"], list)
    idxs = [question["question_index"] for question in marshalled["questions"]]
    assert idxs == [1, 2, 3], "questions must be sorted ascending by question_index"

    # Check parsed fields for one representative question
    q_marshalled = marshalled["questions"][0]  # question_index == 1 -> q2
    assert q_marshalled["id"] == "q-b"
    assert isinstance(q_marshalled["visible_condition"], dict)
    assert isinstance(q_marshalled["mc_options"], list)
    assert isinstance(q_marshalled["answers"], list)

    # Ensure no relationship objects leak from Question
    for item in marshalled["questions"]:
        assert "form" not in item
        assert "form_template" not in item
        assert "category_question" not in item


def test_form_template_propagates_if_include_versions_to_questions():
    """
    When marshal(..., if_include_versions=True), each question must carry its lang_versions,
    and each lang_version should have mc_options properly handled:
    - removed if mc_options == "[]"
    - parsed to list otherwise
    """
    lang_v_en = make_lang_version(lang="en", question_text="BP?", mc_options="[]")
    lang_v_fr = make_lang_version(
        lang="fr", question_text="TA?", mc_options='["Oui","Non"]'
    )
    question = make_question(
        id_="q-lv", question_index=5, lang_versions=[lang_v_en, lang_v_fr]
    )

    form_template = make_form_template(
        id_="ft-lv",
        classification=make_classification("fc-versions"),
        questions=[question],
    )

    marshalled = m.marshal(form_template, shallow=False, if_include_versions=True)

    [qo] = marshalled["questions"]
    assert "lang_versions" in qo
    lang_versions = qo["lang_versions"]
    assert {lv["lang"] for lv in lang_versions} == {"en", "fr"}

    # english: mc_options removed when "[]"
    en_marshalled = next(item for item in lang_versions if item["lang"] == "en")
    assert "mc_options" not in en_marshalled
    assert en_marshalled["question_text"] == "BP?"

    # french: mc_options parsed to list
    fr_marshalled = next(item for item in lang_versions if item["lang"] == "fr")
    assert fr_marshalled["mc_options"] == ["Oui", "Non"]
    assert fr_marshalled["question_text"] == "TA?"


def test_form_template_private_attrs_stripped_and_no_input_mutation():
    """
    Marshal must not leak private attrs from the template, its classification, or questions,
    and should not mutate the source objects.
    """
    form_classification = make_classification("fc-33")
    question = make_question(id_="q-secret", question_index=2)
    form_template = make_form_template(
        id_="ft-secret", classification=form_classification, questions=[question]
    )

    form_template._secret = "nope"
    form_classification._hidden = True
    question._debug = {"x": 1}

    before = (form_template._secret, form_classification._hidden, question._debug)

    marshalled = m.marshal(form_template, shallow=False)

    assert "_secret" not in marshalled
    assert "_hidden" not in marshalled.get("classification", {})
    assert "_debug" not in marshalled["questions"][0]

    after = (form_template._secret, form_classification._hidden, question._debug)
    assert before == after


def test_form_template_classification_does_not_expand_templates_or_leak_relationships():
    """
    Classification payload should not include 'templates' backref.
    (marshal_form_template_classification explicitly removes it.)
    """
    form_classification = make_classification("fc-44")
    question = make_question(id_="q-x", question_index=1)
    form_template = make_form_template(
        id_="ft-44", classification=form_classification, questions=[question]
    )

    marshalled = m.marshal(form_template, shallow=True)
    assert "templates" not in marshalled["classification"]


def test_form_template_type_sanity_and_core_fields():
    """
    Marshal form template should:
    - preserve core scalar fields as same type,
    - preserve the classification field as a compact dict,
    - omit the 'questions' field.
    """
    form_template = make_form_template(
        id_="ft-core",
        version="v2",
        date_created=1700000001,
        archived=False,
        classification=make_classification("fc-55"),
        questions=[],
    )

    marshalled = m.marshal(form_template, shallow=True)

    assert isinstance(marshalled["id"], str) and marshalled["id"] == "ft-core"
    assert isinstance(marshalled["version"], str) and marshalled["version"] == "v2"
    assert (
        isinstance(marshalled["date_created"], int)
        and marshalled["date_created"] == 1700000001
    )
    assert isinstance(marshalled["archived"], bool) and marshalled["archived"] is False
    assert (
        isinstance(marshalled["classification"], dict)
        and marshalled["classification"]["id"] == "fc-55"
    )
    assert "questions" not in marshalled


def make_form_classification_v2(
    *,
    id_="fc-v2-1",
    name_string_id="str-uuid-fc-1",
):
    """
    Construct a minimal FormClassificationOrmV2 instance.

    :param id_: ID of the form classification.
    :param name_string_id: UUID referencing the translation for the classification name.
    :return: Minimal FormClassificationOrmV2 instance.
    """
    classification = FormClassificationOrmV2()
    classification.id = id_
    classification.name_string_id = name_string_id
    return classification


def make_form_template_v2(
    *,
    id_="ft-v2-1",
    form_classification_id="fc-v2-1",
    version=1,
    archived=False,
    date_created=1700000000,
    classification=None,
):
    """
    Construct a minimal FormTemplateOrmV2 instance.

    :param id_: ID of the form template.
    :param form_classification_id: Foreign key to the classification.
    :param version: Integer version number.
    :param archived: Whether the template is archived.
    :param date_created: Timestamp when the template was created.
    :param classification: FormClassificationOrmV2 instance (for testing relationships).
    :return: Minimal FormTemplateOrmV2 instance.
    """
    template = FormTemplateOrmV2()
    template.id = id_
    template.form_classification_id = form_classification_id
    template.version = version
    template.archived = archived
    template.date_created = date_created
    if classification is not None:
        template.classification = classification
    # initialize empty questions list to avoid relationship issues
    template.__dict__["questions"] = []
    return template


def test_form_template_v2_marshal_shallow_omits_questions():
    """
    Shallow marshal should omit nested 'questions' field.
    """
    classification = make_form_classification_v2(
        id_="fc-v2-11", name_string_id="str-uuid-name"
    )
    template = make_form_template_v2(
        id_="ft-v2-9",
        version=3,
        date_created=1700000000,
        archived=True,
        classification=classification,
    )
    # Add some mock questions to verify they're omitted
    template.__dict__["questions"] = [{"id": "q-1"}, {"id": "q-2"}]

    marshalled = m.marshal(template, shallow=True)

    assert "questions" not in marshalled


def test_form_template_v2_marshal_shallow_includes_core_fields():
    """
    Shallow marshal should include all core scalar fields.
    """
    classification = make_form_classification_v2(
        id_="fc-v2-11", name_string_id="str-uuid-name"
    )
    template = make_form_template_v2(
        id_="ft-v2-9",
        version=3,
        date_created=1700000000,
        archived=True,
        classification=classification,
    )

    marshalled = m.marshal(template, shallow=True)

    assert marshalled["id"] == "ft-v2-9"
    assert marshalled["version"] == 3
    assert marshalled["date_created"] == 1700000000
    assert marshalled["archived"] is True
    assert marshalled["form_classification_id"] == "fc-v2-1"


def test_form_template_v2_marshal_shallow_embeds_classification():
    """
    Shallow marshal should include a compact classification dict.
    """
    classification = make_form_classification_v2(
        id_="fc-v2-embed", name_string_id="str-uuid-embedded"
    )
    template = make_form_template_v2(
        id_="ft-v2-embed",
        classification=classification,
    )

    marshalled = m.marshal(template, shallow=True)

    assert "classification" in marshalled
    assert isinstance(marshalled["classification"], dict)
    assert marshalled["classification"]["id"] == "fc-v2-embed"
    assert marshalled["classification"]["name_string_id"] == "str-uuid-embedded"


def test_form_template_v2_marshal_handles_null_classification():
    """
    Marshal should handle templates with no classification gracefully.
    """
    template = make_form_template_v2(
        id_="ft-v2-null-class",
        classification=None,
    )

    marshalled = m.marshal(template, shallow=True)

    assert marshalled["classification"] is None


def test_form_template_v2_marshal_strips_private_attributes():
    """
    Marshal must not leak private attrs from template or classification.
    """
    classification = make_form_classification_v2(id_="fc-v2-33")
    template = make_form_template_v2(
        id_="ft-v2-secret",
        classification=classification,
    )

    template._secret = "test"
    classification._hidden = True

    before_template = template._secret
    before_classification = classification._hidden

    marshalled = m.marshal(template, shallow=True)

    assert "_secret" not in marshalled
    assert "_hidden" not in marshalled.get("classification", {})

    assert template._secret == before_template
    assert classification._hidden == before_classification


def test_form_template_v2_marshal_classification_does_not_expand_templates():
    """
    Classification payload should not include 'templates' backref.
    """
    classification = make_form_classification_v2(id_="fc-v2-44")
    template = make_form_template_v2(
        id_="ft-v2-44",
        classification=classification,
    )

    marshalled = m.marshal(template, shallow=True)

    assert "templates" not in marshalled["classification"]


def test_form_template_v2_marshal_preserves_field_types():
    """
    Marshal form template should preserve core scalar fields with correct types.
    """
    template = make_form_template_v2(
        id_="ft-v2-types",
        version=5,
        date_created=1700000001,
        archived=False,
        classification=make_form_classification_v2(id_="fc-v2-55"),
    )

    marshalled = m.marshal(template, shallow=True)

    assert isinstance(marshalled["id"], str)
    assert isinstance(marshalled["version"], int)
    assert isinstance(marshalled["date_created"], int)
    assert isinstance(marshalled["archived"], bool)
    assert isinstance(marshalled["classification"], dict)


def test_form_template_v2_marshal_version_is_integer():
    """
    Version field should be preserved as an integer (key difference from V1).
    """
    template = make_form_template_v2(id_="ft-v2-ver", version=42)

    marshalled = m.marshal(template, shallow=True)

    assert marshalled["version"] == 42
    assert isinstance(marshalled["version"], int)


def test_form_template_v2_marshal_archived_flag():
    """
    Archived flag should be properly serialized as boolean.
    """
    template_archived = make_form_template_v2(id_="ft-v2-arch-1", archived=True)
    template_active = make_form_template_v2(id_="ft-v2-arch-2", archived=False)

    marshalled_archived = m.marshal(template_archived, shallow=True)
    marshalled_active = m.marshal(template_active, shallow=True)

    assert marshalled_archived["archived"] is True
    assert marshalled_active["archived"] is False


def test_form_template_v2_marshal_date_created_timestamp():
    """
    date_created should be preserved as integer timestamp.
    """
    timestamp = 1699999999
    template = make_form_template_v2(id_="ft-v2-date", date_created=timestamp)

    marshalled = m.marshal(template, shallow=True)

    assert marshalled["date_created"] == timestamp
    assert isinstance(marshalled["date_created"], int)


def test_form_template_v2_marshal_foreign_key_preserved():
    """
    Foreign key form_classification_id should be preserved.
    """
    template = make_form_template_v2(
        id_="ft-v2-fk",
        form_classification_id="fc-custom-id",
    )

    marshalled = m.marshal(template, shallow=True)

    assert marshalled["form_classification_id"] == "fc-custom-id"
