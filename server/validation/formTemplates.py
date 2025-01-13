from typing import Optional

from pydantic import Field, RootModel, field_validator

from service import questionTree
from utils import get_current_time
from validation import CradleBaseModel
from validation.formClassifications import (
    FormClassificationExamples,
    FormClassificationModel,
    FormClassificationModelOptionalId,
)
from validation.questions import TemplateQuestionModel


class FormTemplateExamples:
    id_01 = "dt9-01"
    version = "V1"
    date_created = 1551447833
    archived = False

    example_01 = {
        "id": id_01,
        "version": version,
        "date_created": date_created,
        "form_classification_id": FormClassificationExamples.id,
    }

    with_classification = {
        "id": id_01,
        "version": version,
        "date_created": date_created,
        "form_classification_id": FormClassificationExamples.id,
        "classification": FormClassificationExamples.example_01,
    }


class FormTemplateModel(CradleBaseModel, extra="forbid"):
    id: str
    version: str
    date_created: int = Field(default_factory=get_current_time)
    form_classification_id: Optional[str] = None
    archived: bool = False

    model_config = dict(
        openapi_extra={
            "description": "Form Template",
            "example": FormTemplateExamples.example_01,
        }
    )


class FormTemplateWithClassification(FormTemplateModel):
    """"Form Template model including nested Form Classification""" ""
    classification: FormClassificationModel


class FormTemplateWithQuestions(FormTemplateWithClassification):
    """Form Template model including nested Form Classification and Question models"""

    questions: list[TemplateQuestionModel]

    @field_validator("questions", mode="after")
    @classmethod
    def __validate_questions(cls, questions: list[TemplateQuestionModel]):
        """
        Raises an error if the questions part in /api/forms/templates POST or PUT
        request is not valid (json format, lang versions consistency, question_index constraint).
        """
        lang_version_list = None
        question_index = 0
        for index, question in enumerate(questions):
            # further validate for extra requirements:
            # lang versions consistency: all questions should have same kinds of versions
            # question_index constraint: question index in ascending order
            if index == 0:
                lang_version_list = [v.lang for v in question.question_lang_versions]
                lang_version_list.sort()

                question_index = question.question_index
            else:
                tmp_lang_version_list = [
                    v.lang for v in question.question_lang_versions
                ]
                tmp_lang_version_list.sort()
                if tmp_lang_version_list != lang_version_list:
                    raise ValueError(
                        "lang versions provided between questions are not consistent",
                    )

                cur_question_index = question.question_index
                if question_index < cur_question_index:
                    question_index = cur_question_index
                else:
                    raise ValueError(
                        "Questions should be in index-ascending order.",
                    )

        # validate question question_index tree dfs order
        question_list = [question.model_dump() for question in questions]
        error = questionTree.is_dfs_order(question_list)
        if error is not None:
            print(error)
            raise ValueError(error)
        return questions


class FormTemplateUpload(FormTemplateWithQuestions):
    id: Optional[str] = None
    classification: FormClassificationModelOptionalId


class FormTemplateFull(FormTemplateWithQuestions):
    lang: str


class FormTemplateList(RootModel[list[FormTemplateWithClassification]]):
    model_config = dict(openapi_extra={"example": [FormTemplateExamples.example_01]})  # type: ignore[reportAssignmentType]
