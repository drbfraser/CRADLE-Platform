import pytest
from validation.formTemplates import validate_template, validate_questions

root_question = {
    "categoryIndex": None,  # root question has to have first categoryIndex as None
    "numMax": None,
    "numMin": None,
    "questionId": "referred-by-name",
    "questionIndex": 1,
    "questionLangVersions": [
        {
            "lang": "english",
            "mcOptions": [{"mcid": 0, "opt": "england"}],
            "questionText": "what's your nation",
        }
    ],
    "questionType": "MULTIPLE_CHOICE",
    "required": True,
    "stringMaxLength": None,
    "units": None,
    "visibleCondition": [
        {"answers": {"mcidArray": [0]}, "qidx": 0, "relation": "EQUAL_TO"}
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
    "json, output",
    [
        (valid_template_no_questions, type(None)),
        (valid_template_one_question, type(None)),
        (invalid_type_classification, str),
        (invalid_missing_field, str),
        (invalid_keys, str),
    ],
)
def test_validate_template(json, output):
    message = validate_template(json)
    assert type(message) == output


valid_empty_questions = []

valid_single_question = [root_question]

valid_multi_question = [
    {**root_question, "questionIndex": 0},
    {**root_question, "questionIndex": 1},
]

invalid_questions_out_of_order = [
    {**root_question, "questionIndex": 1},
    {**root_question, "questionIndex": 0},
]

invalid_questions_mult_language = [
    {
        **root_question,
        "questionLangVersions": [
            {
                "lang": "english",
                "mcOptions": [{"mcid": 0, "opt": "england"}],
                "questionText": "what's your nation",
            }
        ],
    },
    {
        **root_question,
        "questionLangVersions": [
            {
                "lang": "chinese",
                "mcOptions": [{"mcid": 0, "opt": "china"}],
                "questionText": "what's your nation",
            }
        ],
    },
]

invalid_first_question_is_not_none = [{**root_question, "categoryIndex": 0}]


@pytest.mark.parametrize(
    "json, output",
    [
        (valid_empty_questions, type(None)),
        (valid_single_question, type(None)),
        (valid_multi_question, type(None)),
        (invalid_questions_out_of_order, str),
        (invalid_questions_mult_language, str),
        (invalid_first_question_is_not_none, str),
    ],
)
def test_validate_template(json, output):
    message = validate_questions(json)
    assert type(message) == output
