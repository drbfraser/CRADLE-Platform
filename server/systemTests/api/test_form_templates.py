import pytest

import data.crud as crud
from models import FormTemplate


def test_form_template_created(database, form_template, api_post):
    response: Response = api_post(endpoint="/api/forms/templates", json=form_template)
    database.session.commit()

    assert response.status_code == 201


@pytest.fixture
def form_template():
    return {
        "name": "NEMS Ambulance Request",
        "category": "Hopsital Report",
        "version": "V1",
        "questions": [
            {
                "questionId": "referred-by-name",
                "isBlank": True,
                "formTemplateId": 5,
                "category": "Referred By",
                "questionIndex": 1,
                "questionText": "How the patient's condition?",
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": {"children": []},
                "mcOptions": ["Decent", "Poor", "Bad", "Severe", "Critical"],
                "answers": {"MC": "Decent"},
            }
        ],
    }
