import pytest
from pydantic import ValidationError

from validation.forms import FormPutValidator, FormValidator

LANGUAGE = "eng"
PATIENT_ID = "123"
QUESTION_LIST = [
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
ID = "adas-d82314-27822-63138"
FORM_TEMPLATE_ID = "adas-d82314-27822-63139"
FORM_CLASSIFICATION_ID = "adas-d82314-27822-63139"
DATE_CREATED = 1592339808
DATE_LAST_EDITED = 1592339808
LAST_EDITED_BY = 123
IS_ARCHIVED = True

form_with_valid_fields_should_return_none = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_missing_optional_fields_should_return_none = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
}

form_with_empty_questions_should_return_none = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": [],
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_with_multiple_questions_should_return_none = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_missing_required_field_lang_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_missing_required_field_patient_id_should_throw_exception = {
    "lang": LANGUAGE,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_missing_required_field_questions_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_lang_has_wrong_type_should_throw_exception = {
    "lang": 123,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_patient_id_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": True,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_questions_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": "string",
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_id_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": 123,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_form_template_id_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": 123,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_form_classification_id_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": 123,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_date_created_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": "string",
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_last_edited_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": True,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_last_edited_by_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": "string",
    "archived": IS_ARCHIVED,
}

form_field_archived_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": 123,
}

form_has_invalid_extra_field_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
    "extra_field": 1,
}

form_date_created_occurs_after_date_edited_should_throw_exception = {
    "lang": LANGUAGE,
    "patient_id": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "form_template_id": FORM_TEMPLATE_ID,
    "form_classification_id": FORM_CLASSIFICATION_ID,
    "date_created": DATE_LAST_EDITED + 100000,
    "last_edited": DATE_LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (form_with_valid_fields_should_return_none, None),
        (form_missing_optional_fields_should_return_none, None),
        (form_with_empty_questions_should_return_none, None),
        (form_with_multiple_questions_should_return_none, None),
        (
            form_missing_required_field_lang_should_throw_exception,
            ValidationError,
        ),
        (
            form_missing_required_field_patient_id_should_throw_exception,
            ValidationError,
        ),
        (
            form_missing_required_field_questions_should_throw_exception,
            ValidationError,
        ),
        (
            form_field_lang_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            form_field_patient_id_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            form_field_questions_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (form_field_id_has_wrong_type_should_throw_exception, ValidationError),
        (
            form_field_form_template_id_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            form_field_form_classification_id_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            form_field_date_created_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            form_field_last_edited_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            form_field_last_edited_by_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            form_field_archived_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (form_has_invalid_extra_field_should_throw_exception, ValidationError),
        (
            form_date_created_occurs_after_date_edited_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validate_form(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormValidator(**json)
    else:
        try:
            FormValidator(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


form_put_with_valid_fields_should_return_none = {
    "questions": [{"id": "asdsd-1123123", "answers": {"number": 4}}]
}

form_put_with_empty_questions_should_return_none = {
    "questions": [],
}

form_put_has_invalid_extra_field_should_throw_exception = {
    "extra_field": "test",
    "questions": [{"id": "asdsd-1123123", "answers": {"number": 4}}],
}

form_put_field_questions_has_wrong_type_should_throw_exception = {
    "questions": "string",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (form_put_with_valid_fields_should_return_none, None),
        (form_put_with_empty_questions_should_return_none, None),
        (
            form_put_has_invalid_extra_field_should_throw_exception,
            ValidationError,
        ),
        (
            form_put_field_questions_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validate_put_request(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormPutValidator(**json)
    else:
        try:
            FormPutValidator(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
