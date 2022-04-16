import pytest


def test_form_created_and_update(
    database, form, form_put, create_patient, api_post, api_put
):
    create_patient()

    response = api_post(endpoint="/api/forms/responses", json=form)
    database.session.commit()
    assert response.status_code == 201

    form_id = "f1"
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


@pytest.fixture
def form_put():
    return {
        "questions": [
            {
                "id": "f_q1",
                "answers": {
                    "mcidArray": [1],
                },
            },
        ]
    }
