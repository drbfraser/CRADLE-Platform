import pytest
import pytest
from validation.forms import validate_form, validate_questions, validate_put_request

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
                {"answers": {"mcidArray": [0]}, "qidx": 0, "relation": "EQUAL_TO"}
            ],
        }
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

invalid_type_lastEditedBy = {
    "id": "123",
    "lang": "english",
    "patientId": "123",
    "formTemplateId": "adas-d82314-27822-63139",
    "formClassificationId": "adas-d82314-27822-63139",
    "dateCreated": 1592339808,
    "lastEdited": 1592339808,
    "lastEditedBy": "123",
    "archived": True,
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
    "json, output",
    [
        (valid_form_json_empty_questions, type(None)),
        (valid_form_json_filled_questions, type(None)),
        (missing_field, str),
        (invalid_keys, str),
        (invalid_type_patientId, str),
        (invalid_type_archived, str),
        (invalid_type_lastEditedBy, str),
        (invalid_type_questions, str),
    ],
)
def test_validate_form(json, output):
    message = validate_form(json)
    assert type(message) == output
