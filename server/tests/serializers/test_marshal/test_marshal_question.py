from data import marshal as m
from enums import QuestionTypeEnum
from models import (
    QuestionOrm,
    QuestionLangVersionOrm,
    FormOrm,
    FormTemplateOrm,
)

def make_lang_version(
    *,
    lang="en",
    question_text="How are you?",
    mc_options="[]",  # JSON string per ORM definition
):
    v = QuestionLangVersionOrm()
    v.lang = lang
    v.question_text = question_text
    v.mc_options = mc_options
    return v


def make_question(
    *,
    id_="q-1",
    is_blank=False,
    question_index=1,
    question_text="Weight",
    question_type=QuestionTypeEnum.INTEGER,
    has_comment_attached=False,
    required=True,
    allow_future_dates=False,
    allow_past_dates=True,
    units=None,
    visible_condition='[{"qidx":1,"relation":"EQUAL_TO","answers":{"number":1}}]',
    mc_options="[]",
    num_min=None,
    num_max=None,
    string_max_length=None,
    answers='{"number": 50, "comment": ""}',
    category_index=None,
    string_max_lines=None,
    # relationship controls
    attach_form=False,
    attach_form_template=False,
    add_category_question=True,
    lang_versions=None,
):
    q = QuestionOrm()
    q.id = id_
    q.is_blank = is_blank
    q.question_index = question_index
    q.question_text = question_text
    q.question_type = question_type
    q.has_comment_attached = has_comment_attached
    q.required = required
    q.allow_future_dates = allow_future_dates
    q.allow_past_dates = allow_past_dates
    q.units = units
    q.visible_condition = visible_condition
    q.mc_options = mc_options
    q.num_min = num_min
    q.num_max = num_max
    q.string_max_length = string_max_length
    q.answers = answers
    q.category_index = category_index
    q.string_max_lines = string_max_lines

    if attach_form:
        q.form = FormOrm()
    if attach_form_template:
        q.form_template = FormTemplateOrm()

    if add_category_question:
        q.category_question = {"id": "cat-1"}

    if lang_versions is not None:
        q.lang_versions = lang_versions

    return q


def test_question_marshal_parses_json_fields_and_strips_relationships():
    """
    Marshal should:
      - parse JSON strings (visible_condition, mc_options, answers),
      - convert Enum fields to their .value,
      - keep scalar booleans/ints/floats,
      - strip None-valued optionals,
      - strip relationship objects (form, form_template) if present,
      - drop private attributes (start with "_").
    """
    q = make_question(
        id_="q-parse",
        question_index=3,
        question_text="Hemoglobin",
        question_type=QuestionTypeEnum.DECIMAL,
        has_comment_attached=True,
        required=True,
        allow_future_dates=False,
        allow_past_dates=True,
        units="g/dL",
        visible_condition='[{"qidx":2,"relation":"GREATER_THAN","answers":{"number":10}}]',
        mc_options="[]",
        answers='{"number": 11.2, "comment": "fingerstick"}',
        num_min=7.0,
        num_max=20.0,
        string_max_length=None,   # removed
        category_index=1,
        string_max_lines=None,    # removed
        attach_form=True,
        attach_form_template=True,
    )

    q._debug = {"trace": True}

    out = m.marshal(q)

    # Core fields
    assert out["id"] == "q-parse"
    assert out["is_blank"] is False
    assert out["question_index"] == 3
    assert out["question_text"] == "Hemoglobin"
    assert out["has_comment_attached"] is True
    assert out["required"] is True
    assert out["allow_future_dates"] is False
    assert out["allow_past_dates"] is True
    assert out["units"] == "g/dL"
    assert out["num_min"] == 7.0
    assert out["num_max"] == 20.0
    assert out["category_index"] == 1

    # Enum serialized to string
    assert out["question_type"] == QuestionTypeEnum.DECIMAL.value

    # JSON fields parsed
    assert isinstance(out["visible_condition"], list)
    assert out["visible_condition"][0]["relation"] == "GREATER_THAN"
    assert isinstance(out["mc_options"], list) and out["mc_options"] == []
    assert isinstance(out["answers"], dict) and out["answers"]["number"] == 11.2

    # Relationship objects are stripped by marshal
    assert "form" not in out
    assert "form_template" not in out

    # None-valued optionals stripped
    assert "string_max_length" not in out
    assert "string_max_lines" not in out

    # Private attrs stripped
    assert "_debug" not in out
    assert all(not k.startswith("_") for k in out.keys())


def test_question_marshal_includes_lang_versions_only_when_requested():
    """
    When if_include_versions=True, include marshaled lang_versions.
    __marshal_lang_version removes mc_options if the stored value is the default "[]".
    """
    lv_en = make_lang_version(
        lang="en",
        question_text="Blood pressure",
        mc_options='["High","Normal","Low"]',
    )
    lv_fr = make_lang_version(
        lang="fr",
        question_text="Tension artérielle",
        mc_options="[]",  # will be dropped on marshal
    )
    q = make_question(
        id_="q-lv",
        question_text="BP (base text)",
        mc_options='["BaseOpt"]',
        lang_versions=[lv_en, lv_fr],
        question_type=QuestionTypeEnum.MULTIPLE_CHOICE,

        attach_form=False,
        attach_form_template=False,
    )

    # Default: versions omitted
    base = m.marshal(q, if_include_versions=False)
    assert "lang_versions" not in base

    # With versions included
    out = m.marshal(q, if_include_versions=True)
    assert "lang_versions" in out and isinstance(out["lang_versions"], list)
    assert {v["lang"] for v in out["lang_versions"]} == {"en", "fr"}

    en = next(v for v in out["lang_versions"] if v["lang"] == "en")
    assert isinstance(en["mc_options"], list) and en["mc_options"] == ["High", "Normal", "Low"]
    assert en["question_text"] == "Blood pressure"

    fr = next(v for v in out["lang_versions"] if v["lang"] == "fr")
    assert fr["question_text"] == "Tension artérielle"
    assert "mc_options" not in fr  # stripped when equal to default "[]"


def test_marshal_question_to_single_version_overrides_text_and_mc_options_conditionally():
    """
    marshal_question_to_single_version should:
      - select the requested version's text,
      - replace mc_options only if that version actually provides options (non-default).
    """
    lv_en = make_lang_version(lang="en", question_text="Gravida (English)", mc_options='["0","1","2+"]')
    lv_fr = make_lang_version(lang="fr", question_text="Geste (Francais)", mc_options="[]") 
    q = make_question(
        id_="q-single",
        question_text="Gravida (base)",
        mc_options='["BaseOnly"]',
        lang_versions=[lv_en, lv_fr],
        question_type=QuestionTypeEnum.INTEGER,
    )

    out_en = m.marshal_question_to_single_version(q, "en")
    assert out_en["question_text"] == "Gravida (English)"
    assert out_en["mc_options"] == ["0", "1", "2+"]
    assert out_en["question_type"] == QuestionTypeEnum.INTEGER.value

    out_fr = m.marshal_question_to_single_version(q, "fr")
    assert out_fr["question_text"] == "Geste (Francais)"
    assert out_fr["mc_options"] == ["BaseOnly"]
