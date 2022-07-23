import pytest

import data.crud as crud
from models import Question, Form, FormTemplate, FormClassification


def test_form_created(
    database,
    form,
    form_template,
    form_classification,
    create_patient,
    api_post,
    api_put,
):
    try:
        create_patient()

        response = api_post(
            endpoint="/api/forms/classifications", json=form_classification
        )
        database.session.commit()
        assert response.status_code == 201

        response = api_post(endpoint="/api/forms/templates", json=form_template)
        database.session.commit()
        assert response.status_code == 201

        response = api_post(endpoint="/api/forms/responses", json=form)
        database.session.commit()
        assert response.status_code == 201

        form_id = "f9"
        question = crud.read(
            Question, formId=form_id, questionText="How the patient's condition?"
        )
        assert question != None
        response = api_put(
            endpoint=f"/api/forms/responses/{form_id}",
            json=form_question_put(question.id),
        )
        database.session.commit()
        assert response.status_code == 201
    finally:
        crud.delete_all(Form, id="f9")
        crud.delete_all(FormTemplate, id="ft9")
        crud.delete_all(FormClassification, name="fc9")


@pytest.fixture
def form(patient_id):
    return {
        "id": "f9",
        "lang": "english",
        "formTemplateId": "ft9",
        "formClassificationId": "fc9",
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


@pytest.fixture
def form_classification():
    return {
        "id": "fc9",
        "name": "fc9",
    }


@pytest.fixture
def form_template():
    return {
        "classification": {"name": "fc9"},
        "id": "ft9",
        "version": "V1",
        "questions": [],
    }


def form_question_put(qid):
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
