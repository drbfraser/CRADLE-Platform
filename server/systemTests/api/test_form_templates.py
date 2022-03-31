from unicodedata import category
import pytest

import data.crud as crud
from models import FormTemplate


def test_form_template_created(database, form_template, api_post):
    response = api_post(endpoint="/api/forms/templates", json=form_template)
    database.session.commit()
    try:
        assert response.status_code == 201
    finally:
        crud.delete_by(
            FormTemplate, name=form_template["name"], category=form_template["category"]
        )


@pytest.fixture
def form_template():
    return {
        "name": "NEMS Ambulance Request - sys test",
        "category": "Hopsital Report - sys test",
        "version": "V1",
        "questions": [
            {
                "id": "ft_q1",
                "questionId": "referred-by-name",
                "isBlank": True,
                "category": "Referred By",
                "questionIndex": 1,
                "questionText": "How the patient's condition?",
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [
                    {"qid": "ft_q2", "relation": "EQUAL_TO", "answers": {"number": 4}}
                ],
                "mcOptions": ["Decent", "Poor", "Bad", "Severe", "Critical"],
                "answers": {},
            }
        ],
    }
