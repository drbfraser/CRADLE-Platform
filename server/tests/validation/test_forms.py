import pytest

from validation.forms import FormPutValidator, FormValidator
from validation.validation_exception import ValidationExceptionError

valid_form_json_empty_questions = {
    "id": "123",
    "lang": "english",
    "patientId": "123",
    "formTemplateId": "adas-d82314-27822-63139",
    "formClassificationId": "adas-d82314-27822-63139",
    "dateCreated": 1592339808,
    "lastEdited": 1592339808,
    "lastEditedBy": 123,
    "archived": True,
    "questions": [],
}

valid_form_json_filled_questions = {
    "archived": False,
    "dateCreated": 1592339808,
    "formClassificationId": "adas-d82314-27822-63139",
    "formTemplateId": "adas-d82314-27822-63139",
    "id": "adas-d82314-27822-63138",
    "lang": "english",
    "lastEdited": 1592339808,
    "lastEditedBy": 2,
    "patientId": "123",
    "questions": [
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
    ],
}

missing_field = {
    "id": "123",
    "lang": "english",
    "patientId": "123",
    "formTemplateId": "adas-d82314-27822-63139",
    "formClassificationId": "adas-d82314-27822-63139",
    "dateCreated": 1592339808,
    "lastEdited": 1592339808,
    "lastEditedBy": 123,
    "archived": True,
}

invalid_keys = {
    "test": "test",
    "id": "123",
    "lang": "english",
    "patientId": "123",
    "formTemplateId": "adas-d82314-27822-63139",
    "formClassificationId": "adas-d82314-27822-63139",
    "dateCreated": 1592339808,
    "lastEdited": 1592339808,
    "lastEditedBy": 123,
    "archived": True,
    "questions": [],
}

invalid_type_patientId = {
    "id": "123",
    "lang": "english",
    "patientId": 123,
    "formTemplateId": "adas-d82314-27822-63139",
    "formClassificationId": "adas-d82314-27822-63139",
    "dateCreated": 1592339808,
    "lastEdited": 1592339808,
    "lastEditedBy": 123,
    "archived": True,
    "questions": [],
}

invalid_type_archived = {
    "id": "123",
    "lang": "english",
    "patientId": "123",
    "formTemplateId": "adas-d82314-27822-63139",
    "formClassificationId": "adas-d82314-27822-63139",
    "dateCreated": 1592339808,
    "lastEdited": 1592339808,
    "lastEditedBy": 123,
    "archived": "True",
    "questions": [],
}

invalid_type_questions = {
    "id": "123",
    "lang": "english",
    "patientId": "123",
    "formTemplateId": "adas-d82314-27822-63139",
    "formClassificationId": "adas-d82314-27822-63139",
    "dateCreated": 1592339808,
    "lastEdited": 1592339808,
    "lastEditedBy": 123,
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
        (invalid_type_patientId, ValidationExceptionError),
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
multi_question = [
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
