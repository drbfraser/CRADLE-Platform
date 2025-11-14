# ruff: noqa: SLF001
import json

from data import marshal as m
from enums import QuestionTypeEnum
from models import (
    FormOrm,
    FormQuestionTemplateOrmV2,
    FormTemplateOrm,
    LangVersionOrmV2,
    QuestionLangVersionOrm,
    QuestionOrm,
)


def make_lang_version(
    *,
    lang="en",
    question_text="How are you?",
    mc_options="[]",  # JSON string per ORM definition
):
    """
    Construct a minimal QuestionLangVersionOrm instance with the given parameters.

    :param lang: Language of the language version.
    :param question_text: Question text of the language version.
    :param mc_options: Multiple choice options for the language version.
    :return: Minimal QuestionLangVersionOrm instance with the given parameters.
    """
    question_lang_version = QuestionLangVersionOrm()
    question_lang_version.lang = lang
    question_lang_version.question_text = question_text
    question_lang_version.mc_options = mc_options
    return question_lang_version


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
    """
    Construct a minimal QuestionOrm instance with the given parameters.

    :param id_: ID of the QuestionOrm to create.
    :param is_blank: Whether the question is a blank template.
    :param question_index: Index of the question in the form.
    :param question_text: Question text of the question.
    :param question_type: Type of the question (integer, text, multiple choice, etc.).
    :param has_comment_attached: Whether the question has a comment field attached.
    :param required: Whether the question must be answered.
    :param allow_future_dates: Whether the question allows future dates as answers.
    :param allow_past_dates: Whether the question allows past dates as answers.
    :param units: Unit of measurement for the question.
    :param visible_condition: Visible condition for the question.
    :param mc_options: Multiple choice options for the question.
    :param num_min: Minimum numerical value allowed for the question.
    :param num_max: Maximum numerical value allowed for the question.
    :param string_max_length: Maximum length of text allowed for the question.
    :param answers: Answer to the question.
    :param category_index: Index of the category in the form.
    :param string_max_lines: Maximum number of lines of text allowed for the question.
    :param attach_form: Whether to create a parent Form and attach it.
    :param attach_form_template: Whether to create a parent FormTemplate and attach it.
    :param add_category_question: Whether to create a parent CategoryQuestion and attach it.
    :param lang_versions: List of language versions for the question.
    :return: Minimal QuestionOrm instance with the given parameters.
    """
    question = QuestionOrm()
    question.id = id_
    question.is_blank = is_blank
    question.question_index = question_index
    question.question_text = question_text
    question.question_type = question_type
    question.has_comment_attached = has_comment_attached
    question.required = required
    question.allow_future_dates = allow_future_dates
    question.allow_past_dates = allow_past_dates
    question.units = units
    question.visible_condition = visible_condition
    question.mc_options = mc_options
    question.num_min = num_min
    question.num_max = num_max
    question.string_max_length = string_max_length
    question.answers = answers
    question.category_index = category_index
    question.string_max_lines = string_max_lines

    if attach_form:
        question.form = FormOrm()
    if attach_form_template:
        question.form_template = FormTemplateOrm()

    if add_category_question:
        question.category_question = {"id": "cat-1"}

    if lang_versions is not None:
        question.lang_versions = lang_versions

    return question


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
    question = make_question(
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
        string_max_length=None,  # removed
        category_index=1,
        string_max_lines=None,  # removed
        attach_form=True,
        attach_form_template=True,
    )

    question._test = {"trace": True}

    marshalled = m.marshal(question)

    # Core fields
    assert marshalled["id"] == "q-parse"
    assert marshalled["is_blank"] is False
    assert marshalled["question_index"] == 3
    assert marshalled["question_text"] == "Hemoglobin"
    assert marshalled["has_comment_attached"] is True
    assert marshalled["required"] is True
    assert marshalled["allow_future_dates"] is False
    assert marshalled["allow_past_dates"] is True
    assert marshalled["units"] == "g/dL"
    assert marshalled["num_min"] == 7.0
    assert marshalled["num_max"] == 20.0
    assert marshalled["category_index"] == 1

    # Enum serialized to string
    assert marshalled["question_type"] == QuestionTypeEnum.DECIMAL.value

    # JSON fields parsed
    assert isinstance(marshalled["visible_condition"], list)
    assert marshalled["visible_condition"][0]["relation"] == "GREATER_THAN"
    assert isinstance(marshalled["mc_options"], list) and marshalled["mc_options"] == []
    assert (
        isinstance(marshalled["answers"], dict)
        and marshalled["answers"]["number"] == 11.2
    )

    # Relationship objects are stripped by marshal
    assert "form" not in marshalled
    assert "form_template" not in marshalled

    # None-valued optionals stripped
    assert "string_max_length" not in marshalled
    assert "string_max_lines" not in marshalled

    # Private attrs stripped
    assert "_test" not in marshalled
    assert all(not k.startswith("_") for k in marshalled)


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
    question = make_question(
        id_="q-lv",
        question_text="BP (base text)",
        mc_options='["BaseOpt"]',
        lang_versions=[lv_en, lv_fr],
        question_type=QuestionTypeEnum.MULTIPLE_CHOICE,
        attach_form=False,
        attach_form_template=False,
    )

    # Default: versions omitted
    base = m.marshal(question, if_include_versions=False)
    assert "lang_versions" not in base

    # With versions included
    marshalled = m.marshal(question, if_include_versions=True)
    assert "lang_versions" in marshalled and isinstance(
        marshalled["lang_versions"], list
    )
    assert {v["lang"] for v in marshalled["lang_versions"]} == {"en", "fr"}

    en = next(v for v in marshalled["lang_versions"] if v["lang"] == "en")
    assert isinstance(en["mc_options"], list) and en["mc_options"] == [
        "High",
        "Normal",
        "Low",
    ]
    assert en["question_text"] == "Blood pressure"

    fr = next(v for v in marshalled["lang_versions"] if v["lang"] == "fr")
    assert fr["question_text"] == "Tension artérielle"
    assert "mc_options" not in fr  # stripped when equal to default "[]"


def test_marshal_question_to_single_version_overrides_text_and_mc_options_conditionally():
    """
    marshal_question_to_single_version should:
      - select the requested version's text,
      - replace mc_options only if that version actually provides options (non-default).
    """
    lv_en = make_lang_version(
        lang="en", question_text="Gravida (English)", mc_options='["0","1","2+"]'
    )
    lv_fr = make_lang_version(
        lang="fr", question_text="Geste (Francais)", mc_options="[]"
    )
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


def make_lang_version_v2(
    *,
    string_id="str-uuid-1",
    lang="English",
    text="What is your age?",
):
    """
    Construct a minimal LangVersionOrmV2 instance with the given parameters.

    :param string_id: UUID identifier for the translatable string.
    :param lang: Language of the translation.
    :param text: Translated text content.
    :return: Minimal LangVersionOrmV2 instance with the given parameters.
    """
    lang_version = LangVersionOrmV2()
    lang_version.string_id = string_id
    lang_version.lang = lang
    lang_version.text = text
    return lang_version


def make_form_question_template_v2(
    *,
    id_="q-v2-1",
    form_template_id="ft-v2-1",
    order=1,
    question_type=QuestionTypeEnum.INTEGER,
    question_string_id="str-uuid-q1",
    mc_options=None,  # JSON string or None
    user_question_id="patient_weight",
    has_comment_attached=False,
    category_index=None,
    required=True,
    visible_condition="[]",
    units=None,
    num_min=None,
    num_max=None,
    string_max_length=None,
    string_max_lines=None,
    allow_future_dates=True,
    allow_past_dates=True,
    attach_template=False,
):
    """
    Construct a minimal FormQuestionTemplateOrmV2 instance with the given parameters.

    :param id_: ID of the question template.
    :param form_template_id: Foreign key to the parent form template.
    :param order: Display order of the question.
    :param question_type: Type of the question (INTEGER, TEXT, MULTIPLE_CHOICE, etc.).
    :param question_string_id: UUID referencing the translation table.
    :param mc_options: JSON string of UUIDs for multiple choice options.
    :param user_question_id: User-defined identifier for workflow/rules engine.
    :param has_comment_attached: Whether the question has a comment field.
    :param category_index: Category grouping index.
    :param required: Whether the question must be answered.
    :param visible_condition: JSON string defining visibility logic.
    :param units: Unit of measurement.
    :param num_min: Minimum numerical value.
    :param num_max: Maximum numerical value.
    :param string_max_length: Maximum string length.
    :param string_max_lines: Maximum number of lines.
    :param allow_future_dates: Whether future dates are allowed.
    :param allow_past_dates: Whether past dates are allowed.
    :param attach_template: Whether to create a mock parent template.
    :return: Minimal FormQuestionTemplateOrmV2 instance.
    """
    question = FormQuestionTemplateOrmV2()
    question.id = id_
    question.form_template_id = form_template_id
    question.order = order
    question.question_type = question_type
    question.question_string_id = question_string_id
    question.mc_options = mc_options
    question.user_question_id = user_question_id
    question.has_comment_attached = has_comment_attached
    question.category_index = category_index
    question.required = required
    question.visible_condition = visible_condition
    question.units = units
    question.num_min = num_min
    question.num_max = num_max
    question.string_max_length = string_max_length
    question.string_max_lines = string_max_lines
    question.allow_future_dates = allow_future_dates
    question.allow_past_dates = allow_past_dates

    if attach_template:
        # Mock template object for testing relationship stripping
        class MockTemplate:
            id = form_template_id

        question.template = MockTemplate()

    return question


def test_form_question_template_v2_marshal_parses_json_fields():
    """
    Marshal should parse JSON strings for visible_condition and mc_options.
    """
    question = make_form_question_template_v2(
        id_="q-v2-parse",
        order=2,
        question_type=QuestionTypeEnum.MULTIPLE_CHOICE,
        question_string_id="str-mc-1",
        mc_options='["opt-uuid-1", "opt-uuid-2", "opt-uuid-3"]',
        user_question_id="blood_type",
        visible_condition='[{"user_qid":"has_blood_test","relation":"EQUAL_TO","value":true}]',
        required=True,
        has_comment_attached=True,
    )

    marshalled = m.marshal(question)

    assert marshalled["id"] == "q-v2-parse"
    assert marshalled["order"] == 2
    assert marshalled["question_type"] == QuestionTypeEnum.MULTIPLE_CHOICE.value
    assert marshalled["question_string_id"] == "str-mc-1"
    assert marshalled["user_question_id"] == "blood_type"
    assert marshalled["required"] is True
    assert marshalled["has_comment_attached"] is True

    assert isinstance(marshalled["visible_condition"], list)
    assert marshalled["visible_condition"][0]["relation"] == "EQUAL_TO"

    assert isinstance(marshalled["mc_options"], list)
    assert len(marshalled["mc_options"]) == 3
    assert "opt-uuid-1" in marshalled["mc_options"]


def test_form_question_template_v2_marshal_validation_fields():
    """
    Marshal should preserve all type-specific validation fields:
    - Numeric: num_min, num_max, units
    - String: string_max_length, string_max_lines
    - Date: allow_future_dates, allow_past_dates
    """
    numeric_q = make_form_question_template_v2(
        id_="q-v2-numeric",
        question_type=QuestionTypeEnum.DECIMAL,
        user_question_id="heart_rate",
        num_min=40.0,
        num_max=200.0,
        units="bpm",
    )
    numeric_marshalled = m.__marshal_form_question_template_v2(numeric_q)
    assert numeric_marshalled["num_min"] == 40.0
    assert numeric_marshalled["num_max"] == 200.0
    assert numeric_marshalled["units"] == "bpm"

    string_q = make_form_question_template_v2(
        id_="q-v2-string",
        question_type=QuestionTypeEnum.STRING,
        user_question_id="patient_notes",
        string_max_length=500,
        string_max_lines=10,
    )
    string_marshalled = m.__marshal_form_question_template_v2(string_q)
    assert string_marshalled["string_max_length"] == 500
    assert string_marshalled["string_max_lines"] == 10

    date_q = make_form_question_template_v2(
        id_="q-v2-date",
        question_type=QuestionTypeEnum.DATE,
        user_question_id="appointment_date",
        allow_future_dates=True,
        allow_past_dates=False,
    )
    date_marshalled = m.__marshal_form_question_template_v2(date_q)
    assert date_marshalled["allow_future_dates"] is True
    assert date_marshalled["allow_past_dates"] is False


def test_form_question_template_v2_marshal_handles_complex_visible_condition():
    """
    Marshal should correctly parse complex nested visible_condition JSON.
    """
    complex_condition = json.dumps(
        [
            {
                "user_qid": "patient_age",
                "relation": "GREATER_THAN",
                "value": 18,
            },
            {
                "user_qid": "has_consent",
                "relation": "EQUAL_TO",
                "value": True,
            },
        ]
    )

    question = make_form_question_template_v2(
        id_="q-v2-complex",
        visible_condition=complex_condition,
    )

    marshalled = m.marshal(question)

    assert isinstance(marshalled["visible_condition"], list)
    assert len(marshalled["visible_condition"]) == 2
    assert marshalled["visible_condition"][0]["user_qid"] == "patient_age"
    assert marshalled["visible_condition"][1]["relation"] == "EQUAL_TO"


def test_form_question_template_v2_marshal_strips_private_attributes():
    """
    Private attributes (starting with _) should be removed during marshalling.
    """
    question = make_form_question_template_v2(id_="q-v2-private")
    question._sa_instance_state = "should_be_removed"
    question._test_data = {"key": "value"}

    marshalled = m.__marshal_form_question_template_v2(question)

    assert all(not k.startswith("_") for k in marshalled)
