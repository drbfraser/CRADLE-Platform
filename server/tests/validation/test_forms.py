import pytest

from validation.forms import FormPutValidator, FormValidator
from validation.validation_exception import ValidationExceptionError

LANGUAGE = "eng"
PATIENT_ID = "123"
QUESTION_LIST = [
    {
        "answers": {
            "comment": None,
            "mcidArray": [0],
            "number": None,
            "text": "today",
        },
        "categoryIndex": 0,
        "hasCommentAttached": False,
        "mcOptions": [{"mcid": 0, "opt": "Decent"}],
        "numMax": None,
        "numMin": None,
        "questionId": "referred-by-name",
        "questionIndex": 1,
        "questionText": "How the patient's condition?",
        "questionType": "MULTIPLE_CHOICE",
        "required": True,
        "stringMaxLength": None,
        "units": None,
        "visibleCondition": [
            {"answers": {"mcidArray": [0]}, "qidx": 0, "relation": "EQUAL_TO"},
        ],
    },
    {
        "answers": {
            "comment": None,
            "mcidArray": [0],
            "number": None,
            "text": "today",
        },
        "categoryIndex": 0,
        "hasCommentAttached": False,
        "mcOptions": [{"mcid": 0, "opt": "Decent"}],
        "numMax": None,
        "numMin": None,
        "questionId": "referred-by-name",
        "questionIndex": 1,
        "questionText": "How the patient's condition?",
        "questionType": "MULTIPLE_CHOICE",
        "required": True,
        "stringMaxLength": None,
        "units": None,
        "visibleCondition": [
            {"answers": {"mcidArray": [0]}, "qidx": 0, "relation": "EQUAL_TO"},
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
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_missing_optional_fields_should_return_none = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
}

form_with_empty_questions_should_return_none = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": [],
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_with_multiple_questions_should_return_none = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_missing_required_field_lang_should_throw_exception = {
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_missing_required_field_patientId_should_throw_exception = {
    "lang": LANGUAGE,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_missing_required_field_questions_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_lang_has_wrong_type_should_throw_exception = {
    "lang": 123,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_patientId_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": True,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_questions_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": "string",
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_id_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": 123,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_formTemplateId_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": 123,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_formClassificationId_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": 123,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_dateCreated_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": "string",
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_lastEdited_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": True,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
}

form_field_lastEditedBy_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": "string",
    "archived": IS_ARCHIVED,
}

form_field_archived_has_wrong_type_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": 123,
}

form_has_invalid_extra_field_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
    "archived": IS_ARCHIVED,
    "extra_field": 1,
}

form_dateCreated_occurs_after_dateEdited_should_throw_exception = {
    "lang": LANGUAGE,
    "patientId": PATIENT_ID,
    "questions": QUESTION_LIST,
    "id": ID,
    "formTemplateId": FORM_TEMPLATE_ID,
    "formClassificationId": FORM_CLASSIFICATION_ID,
    "dateCreated": DATE_LAST_EDITED + 100000,
    "lastEdited": DATE_LAST_EDITED,
    "lastEditedBy": LAST_EDITED_BY,
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
            ValidationExceptionError,
        ),
        (
            form_missing_required_field_patientId_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            form_missing_required_field_questions_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            form_field_lang_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            form_field_patientId_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            form_field_questions_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (form_field_id_has_wrong_type_should_throw_exception, ValidationExceptionError),
        (
            form_field_formTemplateId_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            form_field_formClassificationId_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            form_field_dateCreated_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            form_field_lastEdited_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            form_field_lastEditedBy_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            form_field_archived_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (form_has_invalid_extra_field_should_throw_exception, ValidationExceptionError),
        (
            form_dateCreated_occurs_after_dateEdited_should_throw_exception,
            ValidationExceptionError,
        ),
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
            ValidationExceptionError,
        ),
        (
            form_put_field_questions_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
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
