import pytest

import data.crud as crud
from models import FormTemplate


def test_form_template_created(database, form_template, api_post):
    response = api_post(endpoint="/api/forms/templates", json=form_template)
    database.session.commit()
    try:
        assert response.status_code == 201
    finally:
        crud.delete_by(FormTemplate, id="ft1")


def test_form_template_update(
    database,
    form_template,
    update_info_in_question,
    add_question,
    remove_question,
    api_put,
    api_post,
):
    try:
        response = api_post(endpoint="/api/forms/templates", json=form_template)
        database.session.commit()

        form_template_id = "ft1"
        response = api_put(
            endpoint=f"/api/forms/templates/{form_template_id}",
            json=update_info_in_question,
        )
        database.session.commit()
        assert response.status_code == 201

        response = api_put(
            endpoint=f"/api/forms/templates/{form_template_id}", json=remove_question
        )
        database.session.commit()
        assert response.status_code == 201

        response = api_put(
            endpoint=f"/api/forms/templates/{form_template_id}", json=add_question
        )
        database.session.commit()
        assert response.status_code == 201
    finally:
        crud.delete_by(FormTemplate, id="ft1")


@pytest.fixture
def form_template():
    return {
        "id": "ft1",
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


@pytest.fixture
def update_info_in_question():
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
                        "questionText": "what's your nation?",
                        "mcOptions": [
                            {"mcid": 0, "opt": "England"},
                            {"mcid": 1, "opt": "china"},
                        ],
                    },
                    {
                        "lang": "chinese",
                        "questionText": "你的国籍？",
                        "mcOptions": [
                            {"mcid": 0, "opt": "英格兰"},
                            {"mcid": 1, "opt": "中国"},
                        ],
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


@pytest.fixture
def remove_question():
    return {
        "name": "NEMS Ambulance Request - sys test",
        "category": "Hopsital Report - sys test",
        "version": "V1",
        "questions": [
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


@pytest.fixture
def add_question():
    return {
        "name": "NEMS Ambulance Request - sys test",
        "category": "Hopsital Report - sys test",
        "version": "V1",
        "questions": [
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
            {
                "id": "ft_q3",
                "questionId": "referred-by-name",
                "categoryId": "ft_q2",
                "questionIndex": 1,
                "questionType": "MULTIPLE_CHOICE",
                "required": True,
                "visibleCondition": [],
                "questionLangVersions": [
                    {
                        "lang": "english",
                        "questionText": "what's your nation?",
                        "mcOptions": [
                            {"mcid": 0, "opt": "French"},
                            {"mcid": 1, "opt": "china"},
                        ],
                    },
                    {
                        "lang": "chinese",
                        "questionText": "你的国籍？",
                        "mcOptions": [
                            {"mcid": 0, "opt": "法国"},
                            {"mcid": 1, "opt": "中国"},
                        ],
                    },
                ],
            },
        ],
    }
