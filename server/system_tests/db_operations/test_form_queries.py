import data.db_operations as crud
import models

# read_questions tests


def test_read_questions(form_template_factory):
    template = form_template_factory.create(
        id="test-template-1",
        version="V1",
        questions=[
            {
                "id": "test-question-1",
                "question_index": 0,
                "question_text": "Patient name?",
                "question_type": "STRING",
                "is_blank": True,
                "required": True,
            },
            {
                "id": "test-question-2",
                "question_index": 1,
                "question_text": "Patient age?",
                "question_type": "INTEGER",
                "is_blank": True,
                "required": False,
            },
        ],
    )
    form_template_factory.create(
        id="test-template-2",
        version="V1",
        questions=[
            {
                "id": "test-question-3",
                "question_index": 0,
                "question_text": "Patient name?",
                "question_type": "STRING",
                "is_blank": True,
                "required": True,
            },
            {
                "id": "test-question-4",
                "question_index": 1,
                "question_text": "Patient age?",
                "question_type": "INTEGER",
                "is_blank": True,
                "required": False,
            },
        ],
    )

    questions = crud.read_questions(models.QuestionOrm)

    assert any(question.id == "test-question-3" for question in questions)
    assert any(question.id == "test-question-4" for question in questions)
    assert any(question.id == "test-question-1" for question in questions)

    questions = crud.read_questions(models.QuestionOrm, template.id)

    assert all(
        question.id != "test-question-5" and question.id != "test-question-6"
        for question in questions
    )

    assert any(question.id == "test-question-1" for question in questions)

    questions = crud.read_questions(models.QuestionOrm, "Non-Existent ID")

    assert questions == []


# read_form_template_language_versions tests


def test_read_template_languages_v1(form_template_factory):
    template = form_template_factory.create(
        id="test-template-language-versions",
        version="V1",
        questions=[
            {
                "id": "test-template-language-question",
                "question_index": 0,
                "question_text": "Patient name?",
                "question_type": "STRING",
                "is_blank": True,
                "required": True,
            },
        ],
    )

    crud.create_all(
        [
            models.QuestionLangVersionOrm(
                lang="English",
                question_text="Patient name?",
                question_id="test-template-language-question",
            ),
            models.QuestionLangVersionOrm(
                lang="French",
                question_text="Nom du patient?",
                question_id="test-template-language-question",
            ),
        ]
    )

    languages = crud.read_form_template_language_versions(template)

    assert set(languages) == {"English", "French"}


# read_form_template_language_versions_v2 tests


def test_read_template_languages_v2():
    template = crud.read(models.FormTemplateOrmV2, id="ft-v2-intake-v2")

    languages = crud.read_form_template_language_versions_v2(template)

    assert set(languages) == {"English", "French"}


def test_read_template_languages_v2_refresh():
    template = crud.read(models.FormTemplateOrmV2, id="ft-v2-intake-v1")

    languages = crud.read_form_template_language_versions_v2(template, refresh=True)

    assert set(languages) == {"English", "French"}


def test_read_template_languages_v2_empty():
    template = models.FormTemplateOrmV2(
        id="test-form-template-v2-no-classification",
        version=1,
        archived=False,
    )

    languages = crud.read_form_template_language_versions_v2(template)

    assert languages == []
