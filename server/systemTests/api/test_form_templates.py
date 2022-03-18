import pytest

import data.crud as crud
from models import FormTemplate


def test_invalid_form_template_not_created(
    database, api_post
):
    form_template_json = form_template()
    del form_template_json["name"]
    response: Response = api_post(endpoint="/api/forms/templates", json=form_template_json)
    database.session.commit()

    assert response.status_code == 400


@pytest.fixture
def form_template() {
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
                "questionType": 'MULTIPLE_CHOICE',
                "required": True,
                "units": null,
                "visibleCondition": {
                    "children": []
                },
                "numMax":
                "mcOptions": ['Decent', 'Poor', 'Bad', 'Severe', 'Critical']
                "answers": {
                    "MC": "Decent"
                }
            }
        ]
    }
}