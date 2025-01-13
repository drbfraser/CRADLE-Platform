import json

import pytest
import requests
from humps import decamelize

from data import crud
from models import FormClassificationOrm, FormTemplateOrm


def test_form_template_created_with_same_classification_ids(
    database, form_template, form_template3, form_template4, api_post
):
    try:
        # Upload Form Templates via request body.
        response = api_post(endpoint="/api/forms/templates/body", json=form_template)
        database.session.commit()
        response_body = decamelize(response.json())
        print(response_body)
        assert response.status_code == 201

        response = api_post(endpoint="/api/forms/templates/body", json=form_template3)
        database.session.commit()
        response_body = decamelize(response.json())
        print(response_body)
        assert response.status_code == 409

        response = api_post(endpoint="/api/forms/templates/body", json=form_template4)
        database.session.commit()
        response_body = decamelize(response.json())
        print(response_body)
        assert response.status_code == 201
    finally:
        classification_id = form_template["classification"]["id"]
        crud.delete_by(
            FormTemplateOrm,
            form_classification_id=classification_id,
            version=form_template["version"],
        )
        crud.delete_by(
            FormTemplateOrm,
            form_classification_id=classification_id,
            version=form_template4["version"],
        )


def test_form_template_created(
    database, form_template, form_template_2, url, auth_header
):
    try:
        # Post Form Template as file.
        response = requests.post(
            url=f"{url}/api/forms/templates",
            files={
                "file": (
                    "form_template.json",
                    json.dumps(form_template),
                    "application/json",
                ),
            },
            headers=auth_header,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        print(response_body)
        assert response.status_code == 201

        response = requests.post(
            url=f"{url}/api/forms/templates",
            files={
                "file": (
                    "form_template_2.json",
                    json.dumps(form_template_2),
                    "application/json",
                ),
            },
            headers=auth_header,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        print(response_body)
        assert response.status_code == 201

        # TODO: Test uploading a Form Template as a .csv file.

    finally:
        crud.delete_by(
            FormClassificationOrm, name=form_template["classification"]["name"]
        )
        crud.delete_by(
            FormClassificationOrm,
            name=form_template_2["classification"]["name"],
        )


def test_form_template_archival(
    database, update_info_in_question, api_put, form_template, url, auth_header
):
    try:
        # Post form template as file.
        response = requests.post(
            url=f"{url}/api/forms/templates",
            files={
                "file": (
                    "form_template.json",
                    json.dumps(form_template),
                    "application/json",
                ),
            },
            headers=auth_header,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        print(response_body)
        assert response.status_code == 201

        response = api_put(
            endpoint=f"/api/forms/templates/{form_template['id']}",
            json=update_info_in_question,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        print(response_body)
        assert response.status_code == 201

    finally:
        crud.delete_by(
            FormClassificationOrm, name=form_template["classification"]["name"]
        )


@pytest.fixture
def form_template():
    return {
        "classification": {"id": "e141d855-37e2-421f-a517-9a2fc9437993", "name": "ft1"},
        "id": "ft1",
        "version": "V1",
        "questions": [
            {
                "category_index": None,
                "question_index": 0,
                "question_type": "CATEGORY",
                "required": True,
                "question_lang_versions": [
                    {
                        "lang": "english",
                        "question_text": "information",
                    },
                    {
                        "lang": "chinese",
                        "question_text": "信息",
                    },
                ],
            },
            {
                "category_index": 0,
                "question_index": 1,
                "question_type": "MULTIPLE_CHOICE",
                "required": True,
                "visible_condition": [
                    {
                        "question_index": 0,
                        "relation": "EQUAL_TO",
                        "answers": {"number": 4},
                    },
                ],
                "question_lang_versions": [
                    {
                        "lang": "english",
                        "question_text": "what's your sex?",
                        "mc_options": [
                            {"mc_id": 0, "opt": "male"},
                            {"mc_id": 1, "opt": "female"},
                        ],
                    },
                    {
                        "lang": "chinese",
                        "question_text": "你的性别？",
                        "mc_options": [
                            {"mc_id": 0, "opt": "男"},
                            {"mc_id": 1, "opt": "女"},
                        ],
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
                "category_index": None,
                "question_index": 0,
                "question_type": "MULTIPLE_CHOICE",
                "required": True,
                "visible_condition": [],
                "question_lang_versions": [
                    {
                        "lang": "english",
                        "question_text": "what's your sex?",
                        "mc_options": [
                            {"mc_id": 0, "opt": "male"},
                            {"mc_id": 1, "opt": "female"},
                        ],
                    },
                    {
                        "lang": "chinese",
                        "question_text": "你的性别？",
                        "mc_options": [
                            {"mc_id": 0, "opt": "男"},
                            {"mc_id": 1, "opt": "女"},
                        ],
                    },
                ],
            },
            {
                "category_index": None,
                "question_index": 1,
                "question_type": "CATEGORY",
                "required": True,
                "question_lang_versions": [
                    {
                        "lang": "english",
                        "question_text": "information",
                    },
                    {
                        "lang": "chinese",
                        "question_text": "信息",
                    },
                ],
            },
            {
                "category_index": 1,
                "question_index": 2,
                "question_type": "MULTIPLE_CHOICE",
                "required": True,
                "visible_condition": [],
                "question_lang_versions": [
                    {
                        "lang": "english",
                        "question_text": "what's your sex?",
                        "mc_options": [
                            {"mc_id": 0, "opt": "male"},
                            {"mc_id": 1, "opt": "female"},
                        ],
                    },
                    {
                        "lang": "chinese",
                        "question_text": "你的性别？",
                        "mc_options": [
                            {"mc_id": 0, "opt": "男"},
                            {"mc_id": 1, "opt": "女"},
                        ],
                    },
                ],
            },
        ],
    }


@pytest.fixture
def form_template3():
    return {
        "classification": {"id": "e141d855-37e2-421f-a517-9a2fc9437993", "name": "ft1"},
        "version": "V1",
        "questions": [
            {
                "id": "section header",
                "category_index": None,
                "question_index": 0,
                "question_type": "CATEGORY",
                "required": True,
                "question_lang_versions": [
                    {
                        "lang": "english",
                        "question_text": "information",
                    },
                    {
                        "lang": "chinese",
                        "question_text": "信息",
                    },
                ],
            },
        ],
    }


@pytest.fixture
def form_template4():
    return {
        "classification": {"id": "e141d855-37e2-421f-a517-9a2fc9437993", "name": "ft1"},
        "version": "V2",
        "questions": [
            {
                "id": "section header",
                "category_index": None,
                "question_index": 0,
                "question_type": "CATEGORY",
                "required": True,
                "question_lang_versions": [
                    {
                        "lang": "english",
                        "question_text": "information",
                    },
                    {
                        "lang": "chinese",
                        "question_text": "信息",
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
                "category_index": None,
                "question_index": 0,
                "question_type": "CATEGORY",
                "required": True,
                "question_lang_versions": [
                    {
                        "lang": "english",
                        "question_text": "information",
                    },
                    {
                        "lang": "chinese",
                        "question_text": "信息",
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
                "category_index": None,
                "question_index": 0,
                "question_type": "CATEGORY",
                "required": True,
                "question_lang_versions": [
                    {
                        "lang": "english",
                        "question_text": "information",
                    },
                    {
                        "lang": "chinese",
                        "question_text": "信息",
                    },
                ],
            },
            {
                "category_index": 0,
                "question_index": 1,
                "question_type": "MULTIPLE_CHOICE",
                "required": True,
                "visible_condition": [
                    {
                        "question_index": 0,
                        "relation": "EQUAL_TO",
                        "answers": {"number": 4},
                    },
                ],
                "question_lang_versions": [
                    {
                        "lang": "english",
                        "question_text": "what's your sex?",
                        "mc_options": [
                            {"mc_id": 0, "opt": "male"},
                            {"mc_id": 1, "opt": "female"},
                        ],
                    },
                    {
                        "lang": "chinese",
                        "question_text": "你的性别？",
                        "mc_options": [
                            {"mc_id": 0, "opt": "男"},
                            {"mc_id": 1, "opt": "女"},
                        ],
                    },
                ],
            },
            {
                "category_index": None,
                "question_index": 2,
                "question_type": "MULTIPLE_CHOICE",
                "required": True,
                "visible_condition": [],
                "question_lang_versions": [
                    {
                        "lang": "english",
                        "question_text": "what's your sex?",
                        "mc_options": [
                            {"mc_id": 0, "opt": "male"},
                            {"mc_id": 1, "opt": "female"},
                        ],
                    },
                    {
                        "lang": "chinese",
                        "question_text": "你的性别？",
                        "mc_options": [
                            {"mc_id": 0, "opt": "男"},
                            {"mc_id": 1, "opt": "女"},
                        ],
                    },
                ],
            },
        ],
    }
