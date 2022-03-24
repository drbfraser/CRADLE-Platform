import pytest

import data.crud as crud
from models import Form


@pytest.mark.skip(reason="Form creat test is not done now")
def test_form_created(database, form, api_post):
    response = api_post(endpoint="/api/forms/responses", json=form)
    database.session.commit()

    try:
        assert response.status_code == 201

    finally:
        crud.delete_by(Form, id=form["id"])


@pytest.fixture
def form():
    return {
        "id": "form_12345",
        "name": "NEMS Ambulance Request - Mike",
        "dateCreated": 1592339808,
        "lastEdited": 1592339808,
        "lastEditedBy": None,
        "category": "Referred",
        "patientId": None,
        "questions": [
            {
                "id": "ft_q1",
                "questionId": "referred-by-name",
                "isBlank": True,
                "formId": "form_12345",
                "category": "Referred By",
                "questionIndex": 1,
                "questionText": "How the patient's condition?",
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [
                    {"qid": "ft_q2", "relation": "EQUAL_TO", "answers": {"number": 4}}
                ],
                "mcOptions": ["Decent", "Poor", "Bad", "Severe", "Critical"],
                "answers": {"text": "Poor"},
            }
        ],
    }
