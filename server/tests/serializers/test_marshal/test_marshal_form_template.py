from data import marshal as m
from models import (
    FormTemplateOrm,
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
    answers="[]",
    lang_versions: list[QuestionLangVersionOrm] | None = None,
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
    lv = QuestionLangVersionOrm()
    if id_ is not None:
        lv.id = id_
    lv.lang = lang
    lv.question_text = question_text
    lv.mc_options = mc_options
    return lv


def make_form_template(
    *,
    id_="ft-1",
    version="v1",
    date_created=1_577_836_800,  # 2020-01-01
    archived=False,
    classification: FormClassificationOrm | None = None,
    questions: list[QuestionOrm] | None = None,
):
    ft = FormTemplateOrm()
    ft.id = id_
    ft.version = version
    ft.date_created = date_created
    ft.archived = archived
    if classification:
        ft.classification = classification
    # Ensure the relationship is materialized in __dict__ before marshaling
    ft.questions = questions or []
    return ft


def test_form_template_shallow_omits_questions_and_embeds_classification():
    """
    Shallow marshal should:
    - include core scalar fields,
    - include a compact classification dict,
    - omit nested 'questions'.
    """
    fc = make_classification("fc-11")
    q1 = make_question(id_="q-9", question_index=2)
    q2 = make_question(id_="q-3", question_index=1)
    ft = make_form_template(
        id_="ft-9",
        version="v9",
        date_created=1700000000,
        archived=True,
        classification=fc,
        questions=[q1, q2],
    )

    out = m.marshal(ft, shallow=True)

    assert out["id"] == "ft-9"
    assert out["version"] == "v9"
    assert out["date_created"] == 1700000000
    assert out["archived"] is True

    assert "classification" in out
    assert isinstance(out["classification"], dict)
    assert out["classification"]["id"] == "fc-11"

    # No questions when shallow=True
    assert "questions" not in out


def test_form_template_deep_includes_sorted_questions_and_parses_fields():
    """
    Deep marshal should include questions:
    - sorted by question_index ascending,
    - with JSON fields parsed (visible_condition -> dict, mc_options -> list, answers -> list).
    """
    fc = make_classification("fc-22")
    q1 = make_question(id_="q-a", question_index=3,
                       visible_condition='{"op":"and","rules":[]}',
                       mc_options='["A","B"]',
                       answers='["B"]')
    q2 = make_question(id_="q-b", question_index=1,
                       visible_condition='{"op":"always"}',
                       mc_options='["X"]',
                       answers="[]")
    q3 = make_question(id_="q-c", question_index=2,
                       visible_condition='{"op":"never"}',
                       mc_options='[]',
                       answers='[]')

    # Deliberately unsorted input
    ft = make_form_template(
        id_="ft-deep",
        classification=fc,
        questions=[q1, q2, q3],
    )

    out = m.marshal(ft, shallow=False)

    assert "questions" in out and isinstance(out["questions"], list)
    idxs = [q["question_index"] for q in out["questions"]]
    assert idxs == [1, 2, 3], "questions must be sorted ascending by question_index"

    # Check parsed fields for one representative question
    q_out = out["questions"][0]  # question_index == 1 -> q2
    assert q_out["id"] == "q-b"
    assert isinstance(q_out["visible_condition"], dict)
    assert isinstance(q_out["mc_options"], list)
    assert isinstance(q_out["answers"], list)

    # Ensure no relationship objects leak from Question
    for item in out["questions"]:
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
    lv_en = make_lang_version(lang="en", question_text="BP?", mc_options="[]")
    lv_fr = make_lang_version(lang="fr", question_text="TA?", mc_options='["Oui","Non"]')
    q = make_question(id_="q-lv", question_index=5, lang_versions=[lv_en, lv_fr])

    ft = make_form_template(
        id_="ft-lv",
        classification=make_classification("fc-versions"),
        questions=[q],
    )

    out = m.marshal(ft, shallow=False, if_include_versions=True)

    [qo] = out["questions"]
    assert "lang_versions" in qo
    lvs = qo["lang_versions"]
    assert {lv["lang"] for lv in lvs} == {"en", "fr"}

    # en: mc_options removed when "[]"
    en_out = next(l for l in lvs if l["lang"] == "en")
    assert "mc_options" not in en_out
    assert en_out["question_text"] == "BP?"

    # fr: mc_options parsed to list
    fr_out = next(l for l in lvs if l["lang"] == "fr")
    assert fr_out["mc_options"] == ["Oui", "Non"]
    assert fr_out["question_text"] == "TA?"


def test_form_template_private_attrs_stripped_and_no_input_mutation():
    """
    Marshal must not leak private attrs from the template, its classification, or questions,
    and should not mutate the source objects.
    """
    fc = make_classification("fc-33")
    q = make_question(id_="q-secret", question_index=2)
    ft = make_form_template(id_="ft-secret", classification=fc, questions=[q])

    ft._secret = "nope"
    fc._hidden = True
    q._debug = {"x": 1}

    before = (getattr(ft, "_secret"), getattr(fc, "_hidden"), getattr(q, "_debug"))

    out = m.marshal(ft, shallow=False)

    assert "_secret" not in out
    assert "_hidden" not in out.get("classification", {})
    assert "_debug" not in out["questions"][0]

    after = (getattr(ft, "_secret"), getattr(fc, "_hidden"), getattr(q, "_debug"))
    assert before == after


def test_form_template_classification_does_not_expand_templates_or_leak_relationships():
    fc = make_classification("fc-44")
    q = make_question(id_="q-x", question_index=1)
    ft = make_form_template(id_="ft-44", classification=fc, questions=[q])

    out = m.marshal(ft, shallow=True)
    assert "templates" not in out["classification"]


def test_form_template_type_sanity_and_core_fields():
    ft = make_form_template(
        id_="ft-core",
        version="v2",
        date_created=1700000001,
        archived=False,
        classification=make_classification("fc-55"),
        questions=[],
    )

    out = m.marshal(ft, shallow=True)

    assert isinstance(out["id"], str) and out["id"] == "ft-core"
    assert isinstance(out["version"], str) and out["version"] == "v2"
    assert isinstance(out["date_created"], int) and out["date_created"] == 1700000001
    assert isinstance(out["archived"], bool) and out["archived"] is False
    assert isinstance(out["classification"], dict) and out["classification"]["id"] == "fc-55"
    assert "questions" not in out
