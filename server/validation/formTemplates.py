from typing import List, Optional

from pydantic import field_validator

from service import questionTree
from validation import CradleBaseModel
from validation.formClassifications import FormClassificationModel
from validation.questions import TemplateQuestionModel


class FormTemplateModel(CradleBaseModel, extra="forbid"):
    classification: FormClassificationModel
    version: str
    questions: List[TemplateQuestionModel]
    id: Optional[str] = None

    @field_validator("questions", mode="after")
    @classmethod
    def validate_questions(cls, questions: List[TemplateQuestionModel]):
        """
        Raises an error if the questions part in /api/forms/templates POST or PUT
        request is not valid (json format, lang versions consistency, question_index constraint).

        :param questions: The request body as a dict object
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
