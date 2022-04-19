import pytest

import data.crud as crud
from models import Question


def test_form_created(database, form, create_patient, api_post, api_put):
    create_patient()

    response = api_post(endpoint="/api/forms/responses", json=form)
    database.session.commit()
    assert response.status_code == 201

    form_id = "f1"
    question = crud.read(
        Question, formId=form_id, questionText="How the patient's condition?"
    )
    assert question != None
    response = api_put(
        endpoint=f"/api/forms/responses/{form_id}", json=form_put(question.id)
    )
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
                "questionId": "referred-by-name",
                "categoryIndex": None,
                "questionIndex": 0,
                "questionText": "How the patient's condition?",
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [
                    {"qidx": 0, "relation": "EQUAL_TO", "answers": {"number": 4.0}}
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
                "questionId": None,
                "categoryIndex": None,
                "questionIndex": 1,
                "questionText": "Info",
                "questionType": "CATEGORY",
                "required": True,
            },
        ],
    }


def form_put(qid):
    return {
        "questions": [
            {
                "id": qid,
                "answers": {
                    "mcidArray": [1],
                },
            },
        ]
    }
