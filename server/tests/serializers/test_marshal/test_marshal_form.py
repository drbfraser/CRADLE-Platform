from data import marshal as m
from models import (
    FormOrm,
    FormClassificationOrm,
    QuestionOrm,
    QuestionLangVersionOrm,
)


def make_classification(id_="fc-1"):
    fc = FormClassificationOrm()
    fc.id = id_
    return fc


def make_question(
    *,
    id_="q-1",
    question_index=1,
    visible_condition='{"op":"always"}',
    mc_options='["Yes","No"]',
    answers='["Yes"]',
    lang_versions=None,
):
    q = QuestionOrm()
    q.id = id_
    q.question_index = question_index
    q.visible_condition = visible_condition
    q.mc_options = mc_options
    q.answers = answers
    if lang_versions is not None:
        q.lang_versions = lang_versions
    return q


def make_lang_version(
    *,
    id_=None,
    lang="en",
    question_text="How are you?",
    mc_options="[]",
):
    v = QuestionLangVersionOrm()
    if id_ is not None:
        v.id = id_
    v.lang = lang
    v.question_text = question_text
    v.mc_options = mc_options
    return v


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
    f = FormOrm()
    f.id = id_
    f.lang = lang
    f.name = name
    f.category = category
    f.date_created = date_created
    f.last_edited = last_edited
    f.archived = archived
    f.patient_id = patient_id
    f.form_template_id = form_template_id
    f.last_edited_by = last_edited_by
    f.form_classification_id = form_classification_id
    if classification is not None:
        f.classification = classification
    f.questions = questions or []
    return f


def test_form_shallow_includes_core_fields_and_classification_but_omits_questions_and_patient():
    """
    Shallow marshal should include core scalars and a compact classification,
    omit 'questions', and never leak 'patient'.
    It should also strip None-valued fk fields.
    """
    fc = make_classification("fc-shallow")
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
        form_classification_id="fc-shallow",
        classification=fc,
        questions=[make_question(id_="q-x", question_index=2)],
    )

    out = m.marshal(form, shallow=True)

    # core scalar fields
    assert out["id"] == "f-shallow"
    assert out["lang"] == "fr"
    assert out["name"] == "PNC Follow-up"
    assert out["category"] == "PNC"
    assert out["date_created"] == 1_700_100_000
    assert out["last_edited"] == 1_700_100_111
    assert out["archived"] is True
    assert out["patient_id"] == "p-777"

    # classification embedded, minimally shaped (at least id)
    assert "classification" in out and isinstance(out["classification"], dict)
    assert out["classification"]["id"] == "fc-shallow"

    # shallow: questions omitted
    assert "questions" not in out

    # relationship cleanup: patient should not leak
    assert "patient" not in out

    # None-valued fields must be stripped
    assert "form_template_id" not in out
    assert "last_edited_by" not in out


def test_form_deep_includes_sorted_questions_and_parses_question_fields():
    """
    Deep marshal should:
    - include questions sorted by question_index ascending
    - parse visible_condition (dict), mc_options (list), answers (list)
    - not leak question relationship fields (form/form_template/category_question)
    """
    fc = make_classification("fc-deep")
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
        classification=fc,
        questions=[q2, q1],  # deliberately unsorted on input
    )

    out = m.marshal(form, shallow=False)

    assert "questions" in out and isinstance(out["questions"], list)
    idxs = [q["question_index"] for q in out["questions"]]
    assert idxs == [1, 2], "questions must be sorted ascending by question_index"

    # First question should be q1 (index 1)
    first = out["questions"][0]
    assert first["id"] == "q-1"
    assert isinstance(first["visible_condition"], dict)
    assert isinstance(first["mc_options"], list)
    assert isinstance(first["answers"], list)

    # Ensure relationship fields are not leaked from each question
    for qo in out["questions"]:
        assert "form" not in qo
        assert "form_template" not in qo
        assert "category_question" not in qo


def test_form_deep_does_not_mutate_source_objects_and_strips_privates_everywhere():
    """
    Marshal should not mutate the source objects (e.g., not resort the original
    questions list) and must strip private attributes from form, classification, and questions.
    """
    fc = make_classification("fc-priv")
    qA = make_question(id_="q-A", question_index=3)
    qB = make_question(id_="q-B", question_index=1)
    qC = make_question(id_="q-C", question_index=2)
    form = make_form(id_="f-priv", classification=fc, questions=[qA, qB, qC])

    # Add private attrs that must be stripped
    form._secret = "nope"
    fc._hidden = True
    qA._debug = {"x": 1}

    # Snapshot original question order to prove non-mutation
    original_order = [q.id for q in form.questions]

    out = m.marshal(form, shallow=False)

    # Private attributes shouldn't appear
    assert "_secret" not in out
    assert "_hidden" not in out.get("classification", {})
    assert "_debug" not in out["questions"][0]  # check any representative elem
    for qo in out["questions"]:
        for k in qo.keys():
            assert not k.startswith("_")

    assert [q.id for q in form.questions] == original_order


def test_form_classification_backrefs_do_not_leak_templates():
    """
    The classification payload should not include 'templates' backref.
    (marshal_form_classification explicitly removes it.)
    """
    fc = make_classification("fc-noleak")
    form = make_form(id_="f-noleak", classification=fc)

    out = m.marshal(form, shallow=True)
    assert "templates" not in out["classification"]


def test_form_marshal_with_type_uses_shallow_and_sets_type():
    """
    marshal_with_type(form) should:
    - use shallow form marshaling (questions omitted),
    - inject 'type': 'form'.
    """
    fc = make_classification("fc-type")
    form = make_form(
        id_="f-type",
        classification=fc,
        questions=[make_question(id_="q-1", question_index=1)],
    )

    out = m.marshal_with_type(form, shallow=False)

    assert out["type"] == "form"
    assert out["id"] == "f-type"
    assert "questions" not in out
    assert "classification" in out and out["classification"]["id"] == "fc-type"
