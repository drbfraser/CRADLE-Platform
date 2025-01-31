from common.commonUtil import filterNestedAttributeWithValueNone
from data import crud
from models import (
    FormClassificationOrm,
    FormTemplateOrm,
    QuestionLangVersionOrm,
    QuestionOrm,
)
from validation.formTemplates import FormTemplateUpload
from validation.questions import QuestionLangVersionModel, TemplateQuestion


def _create_question_lang_version_orm(
    lang_version: QuestionLangVersionModel,
) -> QuestionLangVersionOrm:
    lang_version_dict = lang_version.model_dump()
    lang_version_dict = filterNestedAttributeWithValueNone(lang_version_dict)
    return QuestionLangVersionOrm(**lang_version_dict)


def _create_question_orm(question: TemplateQuestion) -> QuestionOrm:
    lang_version_orms = [
        _create_question_lang_version_orm(lang_version)
        for lang_version in question.lang_versions
    ]

    question_dict = question.model_dump()
    del question_dict["lang_versions"]
    question_dict = filterNestedAttributeWithValueNone(question_dict)

    question_orm = QuestionOrm(**question_dict)
    question_orm.lang_versions = lang_version_orms
    return question_orm

# is this unused?
def create_form_template_orm(form_template: FormTemplateUpload) -> FormTemplateOrm:
    question_orms = [
        _create_question_orm(question) for question in form_template.questions
    ]

    form_classification_orm = crud.read(
        FormClassificationOrm,
        id=form_template.classification.id,
    )
    if form_classification_orm is None:
        form_classification_dict = form_template.classification.model_dump()
        form_classification_dict = filterNestedAttributeWithValueNone(
            form_classification_dict
        )
        form_classification_orm = FormClassificationOrm(**form_classification_dict)

    form_template_dict = form_template.model_dump()
    del form_template_dict["classification"]
    del form_template_dict["questions"]
    form_template_dict = filterNestedAttributeWithValueNone(form_template_dict)

    form_template_orm = FormTemplateOrm(**form_template_dict)
    form_template_orm.classification = form_classification_orm
    form_template_orm.questions = question_orms
    return form_template_orm
