import pytest

import data.crud as crud
from models import Form


def test_form_created_and_update(database, form, form_put, create_patient, api_post, api_put):
    create_patient()

    response = api_post(endpoint="/api/forms/responses", json=form)
    database.session.commit()
    resp_json = response.json()
    assert response.status_code == 201
    assert resp_json["dateCreated"] == resp_json["lastEdited"]

    form_id="f1"
    response = api_put(endpoint=f"/api/forms/responses/{form_id}", json=form_put)
    database.session.commit()
    assert response.status_code == 201

@pytest.fixture
def form(patient_id):
    return {
        "id": "f1",
        "lang": "english",
        "name": "NEMS Ambulance Request - sys test",
        "category": "Referred",
        "patientId": patient_id,
        "questions": [
            {
                "id": "f_q1",
                "questionId": "referred-by-name",
                "categoryId": "f_q2",
                "questionIndex": 1,
                "questionText": "How the patient's condition?",
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [
                    {"qid": "f_q2", "relation": "EQUAL_TO", "answers": {"number": 4.0}}
                ],
                "mcOptions": [
                    {
                        "mcid": 0,
                        "opt": "Decent",
                    },
                    {
                        "mcid": 1,
                        "opt": "French",
                    },
                ],
                "answers": {"mcidArray": [0]},
            },
            {
                "id": "f_q2",
                "questionId": None,
                "categoryId": None,
                "questionIndex": 0,
                "questionText": "Info",
                "questionType": "CATEGORY",
                "required": True,
            },
        ],
    }

@pytest.fixture
def form_put():
    return {
        "questions": [
            {
                "id": "f_q1",
                "answers": {
                    "mcidArray": [1],
                }
            },
        ]
    }