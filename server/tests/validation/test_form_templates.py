import pytest
from pydantic import ValidationError

from validation.formTemplates import FormTemplateModel

CLASSIFICATION = {"id": "123", "name": "example_name"}
VERSION = "V1"
ID = "asdsd-sdsw1231"

root_question = {
    "id": "root_question",
    "category_index": None,  # root question has to have first category_index as None
    "num_max": None,
    "num_min": None,
    "question_index": 1,
    "question_lang_versions": [
        {
            "lang": "english",
            "mc_options": [{"mc_id": 0, "opt": "england"}],
            "question_text": "what's your nation",
        },
    ],
    "question_type": "MULTIPLE_CHOICE",
    "required": True,
    "string_max_length": None,
    "units": None,
    "visible_condition": [
        {"answers": {"mc_id_array": [0]}, "question_index": 0, "relation": "EQUAL_TO"},
    ],
}

template_with_valid_fields_and_no_question_should_return_none = {
    "classification": CLASSIFICATION,
    "id": ID,
    "questions": [],
    "version": VERSION,
}

template_with_valid_fields_and_one_question_should_return_none = {
    "classification": CLASSIFICATION,
    "id": ID,
    "questions": [root_question],
    "version": VERSION,
}

template_missing_required_field_classification_should_throw_exception = {
    "id": ID,
    "questions": [],
    "version": VERSION,
}

template_missing_required_field_version_should_throw_exception = {
    "classification": CLASSIFICATION,
    "id": ID,
    "questions": [],
}

template_missing_required_field_questions_should_throw_exception = {
    "classification": CLASSIFICATION,
    "id": ID,
    "version": VERSION,
}

template_missing_optional_field_id_should_return_none = {
    "classification": CLASSIFICATION,
    "questions": [],
    "version": VERSION,
}

template_field_classification_has_wrong_type_should_throw_exception = {
    "classification": "",
    "id": ID,
    "questions": [],
    "version": VERSION,
}

template_field_id_has_wrong_type_should_throw_exception = {
    "classification": CLASSIFICATION,
    "id": 111,
    "questions": [],
    "version": VERSION,
}

template_field_questions_has_wrong_type_should_throw_exception = {
    "classification": CLASSIFICATION,
    "id": ID,
    "questions": "string",
    "version": VERSION,
}

template_field_version_has_wrong_type_should_throw_exception = {
    "classification": CLASSIFICATION,
    "id": ID,
    "questions": [],
    "version": 111,
}

template_has_invalid_extra_field_should_throw_exception = {
    "classification": CLASSIFICATION,
    "id": ID,
    "questions": [],
    "version": VERSION,
    "extra": "extra field is not acceptable",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (
            template_with_valid_fields_and_no_question_should_return_none,
            None,
        ),
        (template_with_valid_fields_and_one_question_should_return_none, None),
        (
            template_missing_required_field_classification_should_throw_exception,
            ValidationError,
        ),
        (
            template_missing_required_field_version_should_throw_exception,
            ValidationError,
        ),
        (
            template_missing_required_field_questions_should_throw_exception,
            ValidationError,
        ),
        (template_missing_optional_field_id_should_return_none, None),
        (
            template_field_classification_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            template_field_id_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            template_field_questions_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            template_field_version_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            template_has_invalid_extra_field_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validate_template(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormTemplateModel(**json)
    else:
        try:
            FormTemplateModel(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
