import pytest

import data.crud as crud
from models import Form


def test_form_created(database, form, create_patient, api_post):
    create_patient()

    response = api_post(endpoint="/api/forms/responses", json=form)
    database.session.commit()
    form_id = None
    try:
        assert response.status_code == 201
        resp_json = response.json()
        form_id = resp_json["id"]
        assert resp_json["dateCreated"] == resp_json["lastEdited"]
    finally:
        crud.delete_by(Form, id=form_id)


@pytest.fixture
def form(patient_id, vht_user_id):
    return {
        "name": "NEMS Ambulance Request - sys test",
        "dateCreated": 1592339808,
        "lastEditedBy": vht_user_id,
        "category": "Referred",
        "patientId": patient_id,
        "questions": [
            {
                "id": "ft_q1",
                "questionId": "referred-by-name",
                "isBlank": False,
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
