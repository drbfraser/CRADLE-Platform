import pytest

import data.crud as crud
from models import FormClassification, FormTemplate


def test_form_template_created(database, form_template, form_template_2, api_post):
    try:
        response = api_post(endpoint="/api/forms/templates", json=form_template)
        database.session.commit()
        assert response.status_code == 201
        response = api_post(endpoint="/api/forms/templates", json=form_template_2)
        database.session.commit()
        assert response.status_code == 201
    finally:
        crud.delete_by(FormClassification, name="ft1")
        crud.delete_by(FormClassification, name="ft2")


def test_form_template_archival(
    database, update_info_in_question, api_put, api_post, form_template
):
    try:
        response = api_post(endpoint="/api/forms/templates", json=form_template)
        database.session.commit()
        assert response.status_code == 201

        form_template_id = "ft1"
        response = api_put(
            endpoint=f"/api/forms/templates/{form_template_id}",
            json=update_info_in_question,
        )
        database.session.commit()
        assert response.status_code == 201

    finally:
        crud.delete_by(FormClassification, name="ft1")


@pytest.fixture
def form_template():
    return {
        "classification": {"name": "ft1"},
        "id": "ft1",
        "version": "V1",
        "questions": [
            {
                "questionId": "section header",
                "categoryIndex": None,
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
            {
                "questionId": "referred-by-name",
                "categoryIndex": 0,
                "questionIndex": 1,
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [
                    {"qidx": 0, "relation": "EQUAL_TO", "answers": {"number": 4}}
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
        ],
    }


@pytest.fixture
def form_template_2():
    return {
        "classification": {"name": "ft2"},
        "id": "ft2",
        "version": "V2",
        "questions": [
            {
                "questionId": "referred-by-name",
                "categoryIndex": None,
                "questionIndex": 0,
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [],
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
                "questionId": "section header",
                "categoryIndex": None,
                "questionIndex": 1,
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
            {
                "questionId": "referred-by-name",
                "categoryIndex": 1,
                "questionIndex": 2,
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [],
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
        ],
    }


@pytest.fixture
def update_info_in_question():
    return {"archived": True}


@pytest.fixture
def remove_question():
    return {
        "version": "V1.2",
        "questions": [
            {
                "questionId": "section header",
                "categoryIndex": None,
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


@pytest.fixture
def add_question():
    return {
        "version": "V1.3",
        "questions": [
            {
                "questionId": "section header",
                "categoryIndex": None,
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
            {
                "questionId": "referred-by-name",
                "categoryIndex": 0,
                "questionIndex": 1,
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [
                    {"qidx": 0, "relation": "EQUAL_TO", "answers": {"number": 4}}
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
                "questionId": "referred-by-name",
                "categoryIndex": None,
                "questionIndex": 2,
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [],
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
        ],
    }
