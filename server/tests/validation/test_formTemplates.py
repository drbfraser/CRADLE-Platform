import pytest

from validation.formTemplates import FormTemplateValidator
from validation.validation_exception import ValidationExceptionError

root_question = {
    "category_index": None,  # root question has to have first category_index as None
    "num_max": None,
    "num_min": None,
    "question_id": "referred-by-name",
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

valid_template_no_questions = {
    "classification": {"id": "123", "name": "example_name"},
    "id": "asdsd-sdsw1231",
    "questions": [],
    "version": "V1",
}

valid_template_one_question = {
    "classification": {"id": "123", "name": "example_name"},
    "id": "asdsd-sdsw1231",
    "questions": [root_question],
    "version": "V1",
}

invalid_type_classification = {
    "classification": "",
    "id": "asdsd-sdsw1231",
    "questions": [],
    "version": "V1",
}

invalid_missing_field = {"id": "asdsd-sdsw1231", "questions": [], "version": "V1"}

invalid_keys = {
    "test": "test",
    "classification": {"id": "123", "name": "example_name"},
    "id": "asdsd-sdsw1231",
    "questions": [],
    "version": "V1",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_template_no_questions, None),
        (valid_template_one_question, None),
        (invalid_type_classification, ValidationExceptionError),
        (invalid_missing_field, ValidationExceptionError),
        (invalid_keys, ValidationExceptionError),
    ],
)
def test_validate_template(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormTemplateValidator.validate(json)
    else:
        try:
            FormTemplateValidator.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


valid_empty_questions = []

valid_single_question = [root_question]

valid_multi_question = [
    {**root_question, "question_index": 0},
    {**root_question, "question_index": 1},
]

invalid_questions_out_of_order = [
    {**root_question, "question_index": 1},
    {**root_question, "question_index": 0},
]

invalid_questions_mult_language = [
    {
        **root_question,
        "question_lang_versions": [
            {
                "lang": "english",
                "mc_options": [{"mc_id": 0, "opt": "england"}],
                "question_text": "what's your nation",
            },
        ],
    },
    {
        **root_question,
        "question_lang_versions": [
            {
                "lang": "chinese",
                "mc_options": [{"mc_id": 0, "opt": "china"}],
                "question_text": "what's your nation",
            },
        ],
    },
]

invalid_first_question_is_not_none = [{**root_question, "category_index": 0}]


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_empty_questions, None),
        (valid_single_question, None),
        (valid_multi_question, None),
        (invalid_questions_out_of_order, ValidationExceptionError),
        (invalid_questions_mult_language, ValidationExceptionError),
        (invalid_first_question_is_not_none, ValidationExceptionError),
    ],
)
def test_validate_questions(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormTemplateValidator.validate_questions(json)
    else:
        try:
            FormTemplateValidator.validate_questions(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
