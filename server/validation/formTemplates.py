from typing import List, Optional

from pydantic import BaseModel, ValidationError

from service import questionTree
from validation.questions import TemplateQuestionValidator
from validation.validation_exception import ValidationExceptionError


class ClassificationValidator(BaseModel):
    name: str
    id: Optional[str] = None


class FormTemplateValidator(BaseModel):
    classification: ClassificationValidator
    version: str
    questions: List[TemplateQuestionValidator]
    id: Optional[str] = None

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the template part in /api/forms/templates POST or PUT
        request is not valid.

        :param request_body: The request body as a dict object
        """
        try:
            FormTemplateValidator(**request_body)
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))

    @staticmethod
    def validate_questions(questions: list):
        """
        Raises an error if the questions part in /api/forms/templates POST or PUT
        request is not valid (json format, lang versions consistency, question_index constraint).

        :param questions: The request body as a dict object
        """
        lang_version_list, question_index = None, None
        for index, question in enumerate(questions):
            # validate each question
            try:
                TemplateQuestionValidator(**question)
            except ValidationError as e:
                print(e)
                raise ValidationExceptionError(str(e.errors()[0]["msg"]))

            # further validate for extra requirements:
            # lang versions consistency: all questions should have same kinds of versions
            # question_index constraint: question index in ascending order
            if index == 0:
                lang_version_list = [
                    v.get("lang") for v in question.get("question_lang_versions")
                ]
                lang_version_list.sort()

                question_index = question.get("question_index")
            else:
                tmp_lang_version_list = [
                    v.get("lang") for v in question.get("question_lang_versions")
                ]
                tmp_lang_version_list.sort()
                if tmp_lang_version_list != lang_version_list:
                    raise ValidationExceptionError(
                        "lang versions provided between questions are not consistent",
                    )

                cur_question_index = question.get("question_index")
                if question_index < cur_question_index:
                    question_index = cur_question_index
                else:
                    raise ValidationExceptionError(
                        "questions should be in index-ascending order",
                    )

        # validate question question_index tree dfs order
        error = questionTree.is_dfs_order(questions)
        if error:
            print(error)
            raise ValidationExceptionError(str(error))
