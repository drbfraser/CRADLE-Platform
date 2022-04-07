from unicodedata import category
import pytest

import data.crud as crud
from models import FormTemplate


# def test_form_template_created(database, form_template, api_post):
#     response = api_post(endpoint="/api/forms/templates", json=form_template)
#     database.session.commit()
#     form_template_id = None
#     try:
#         assert response.status_code == 201
#         resp_json = response.json()
#         print(resp_json)
#         form_template_id = resp_json["id"]
#     finally:
#         crud.delete_by(FormTemplate, id=form_template_id)


def test_form_template_created_commit(database, form_template, api_post):
    response = api_post(endpoint="/api/forms/templates", json=form_template)
    database.session.commit()
    print(response.json().get("id"))
    assert response.status_code == 201


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
                "categoryId": "ft_q2",
                "questionIndex": 1,
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [
                    {"qid": "ft_q2", "relation": "EQUAL_TO", "answers": {"number": 4}}
                ],
                "questionLangVersions": [
                    {
                        "lang": "english",
                        "questionText": "what's your sex?",
                        "mcOptions": [
                            {"mcid": 0, "opt": "male"},
                            {"mcid": 1, "opt": "female"},
                        ],
                    },
                    {
                        "lang": "chinese",
                        "questionText": "你的性别？",
                        "mcOptions": [{"mcid": 0, "opt": "男"}, {"mcid": 1, "opt": "女"}],
                    },
                ],
            },
            {
                "id": "ft_q2",
                "questionId": "section header",
                "categoryId": None,
                "questionIndex": 0,
                "questionType": "CATEGORY",
                "required": True,
                "questionLangVersions": [
                    {
                        "lang": "english",
                        "questionText": "information",
                    },
                    {
                        "lang": "chinese",
                        "questionText": "信息",
                    },
                ],
            },
        ],
    }
