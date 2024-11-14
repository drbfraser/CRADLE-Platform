import pytest

from validation.forms import FormPutValidator, FormValidator
from validation.validation_exception import ValidationExceptionError

valid_form_json_empty_questions = {
    "id": "123",
    "lang": "english",
    "patient_id": "123",
    "form_template_id": "adas-d82314-27822-63139",
    "form_classification_id": "adas-d82314-27822-63139",
    "date_created": 1592339808,
    "last_edited": 1592339808,
    "last_edited_by": 123,
    "archived": True,
    "questions": [],
}

valid_form_json_filled_questions = {
    "archived": False,
    "date_created": 1592339808,
    "form_classification_id": "adas-d82314-27822-63139",
    "form_template_id": "adas-d82314-27822-63139",
    "id": "adas-d82314-27822-63138",
    "lang": "english",
    "last_edited": 1592339808,
    "last_edited_by": 2,
    "patient_id": "123",
    "questions": [
        {
            "answers": {
                "comment": None,
                "mc_id_array": [0],
                "number": None,
                "text": "today",
            },
            "category_index": 0,
            "has_comment_attached": False,
            "mc_options": [{"mc_id": 0, "opt": "Decent"}],
            "num_max": None,
            "num_min": None,
            "question_id": "referred-by-name",
            "question_index": 1,
            "question_text": "How the patient's condition?",
            "question_type": "MULTIPLE_CHOICE",
            "required": True,
            "string_max_length": None,
            "units": None,
            "visible_condition": [
                {
                    "answers": {"mc_id_array": [0]},
                    "question_index": 0,
                    "relation": "EQUAL_TO",
                },
            ],
        },
    ],
}

missing_field = {
    "id": "123",
    "lang": "english",
    "patient_id": "123",
    "form_template_id": "adas-d82314-27822-63139",
    "form_classification_id": "adas-d82314-27822-63139",
    "date_created": 1592339808,
    "last_edited": 1592339808,
    "last_edited_by": 123,
    "archived": True,
}

invalid_keys = {
    "test": "test",
    "id": "123",
    "lang": "english",
    "patient_id": "123",
    "form_template_id": "adas-d82314-27822-63139",
    "form_classification_id": "adas-d82314-27822-63139",
    "date_created": 1592339808,
    "last_edited": 1592339808,
    "last_edited_by": 123,
    "archived": True,
    "questions": [],
}

invalid_type_patient_id = {
    "id": "123",
    "lang": "english",
    "patient_id": 123,
    "form_template_id": "adas-d82314-27822-63139",
    "form_classification_id": "adas-d82314-27822-63139",
    "date_created": 1592339808,
    "last_edited": 1592339808,
    "last_edited_by": 123,
    "archived": True,
    "questions": [],
}

invalid_type_archived = {
    "id": "123",
    "lang": "english",
    "patient_id": "123",
    "form_template_id": "adas-d82314-27822-63139",
    "form_classification_id": "adas-d82314-27822-63139",
    "date_created": 1592339808,
    "last_edited": 1592339808,
    "last_edited_by": 123,
    "archived": "True",
    "questions": [],
}

invalid_type_questions = {
    "id": "123",
    "lang": "english",
    "patient_id": "123",
    "form_template_id": "adas-d82314-27822-63139",
    "form_classification_id": "adas-d82314-27822-63139",
    "date_created": 1592339808,
    "last_edited": 1592339808,
    "last_edited_by": 123,
    "archived": True,
    "questions": "",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_form_json_empty_questions, None),
        (valid_form_json_filled_questions, None),
        (missing_field, ValidationExceptionError),
        (invalid_keys, ValidationExceptionError),
        (invalid_type_patient_id, ValidationExceptionError),
        (invalid_type_archived, ValidationExceptionError),
        (invalid_type_questions, ValidationExceptionError),
    ],
)
def test_validate_form(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormValidator.validate(json)
    else:
        try:
            FormValidator.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


empty_questions = []
single_question = [
    {
        "answers": {
            "comment": None,
            "mc_id_array": [0],
            "number": None,
            "text": "today",
        },
        "category_index": 0,
        "has_comment_attached": False,
        "mc_options": [{"mc_id": 0, "opt": "Decent"}],
        "num_max": None,
        "num_min": None,
        "question_id": "referred-by-name",
        "question_index": 1,
        "question_text": "How the patient's condition?",
        "question_type": "MULTIPLE_CHOICE",
        "required": True,
        "string_max_length": None,
        "units": None,
        "visible_condition": [
            {
                "answers": {"mc_id_array": [0]},
                "question_index": 0,
                "relation": "EQUAL_TO",
            },
        ],
    },
]
multi_question = [
    {
        "answers": {
            "comment": None,
            "mc_id_array": [0],
            "number": None,
            "text": "today",
        },
        "category_index": 0,
        "has_comment_attached": False,
        "mc_options": [{"mc_id": 0, "opt": "Decent"}],
        "num_max": None,
        "num_min": None,
        "question_id": "referred-by-name",
        "question_index": 1,
        "question_text": "How the patient's condition?",
        "question_type": "MULTIPLE_CHOICE",
        "required": True,
        "string_max_length": None,
        "units": None,
        "visible_condition": [
            {
                "answers": {"mc_id_array": [0]},
                "question_index": 0,
                "relation": "EQUAL_TO",
            },
        ],
    },
    {
        "answers": {
            "comment": None,
            "mc_id_array": [0],
            "number": None,
            "text": "today",
        },
        "category_index": 0,
        "has_comment_attached": False,
        "mc_options": [{"mc_id": 0, "opt": "Decent"}],
        "num_max": None,
        "num_min": None,
        "question_id": "referred-by-name",
        "question_index": 1,
        "question_text": "How the patient's condition?",
        "question_type": "MULTIPLE_CHOICE",
        "required": True,
        "string_max_length": None,
        "units": None,
        "visible_condition": [
            {
                "answers": {"mc_id_array": [0]},
                "question_index": 0,
                "relation": "EQUAL_TO",
            },
        ],
    },
]


valid_put_request = {"questions": [{"id": "asdsd-1123123", "answers": {"number": 4}}]}

invalid_keys_put_request = {
    "test": "test",
    "questions": [{"id": "asdsd-1123123", "answers": {"number": 4}}],
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_put_request, None),
        (invalid_keys_put_request, ValidationExceptionError),
    ],
)
def test_validate_put_request(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormPutValidator.validate(json)
    else:
        try:
            FormPutValidator.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
