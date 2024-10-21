from typing import List, Optional

from pydantic import BaseModel, ValidationError

from service import questionTree
from validation.questions import TemplateQuestion
from validation.validation_exception import ValidationExceptionError


class Classification(BaseModel):
    name: str
    id: Optional[str] = None


class FormTemplate(BaseModel):
    classification: Classification
    version: str
    questions: List[TemplateQuestion]
    id: Optional[str] = None

    class Config:
        extra = "forbid"


def validate_template(request_body: dict):
    """
    Returns an error message if the template part in /api/forms/templates POST or PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    try:
        FormTemplate(**request_body)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return None


def validate_questions(questions: list):
    """
    Returns an error message if the questions part in /api/forms/templates POST or PUT
    request is not valid (json format, lang versions consistency, qindex constraint).
    Else, returns None.

    :param questions: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    lang_version_list, qindex = None, None
    for index, question in enumerate(questions):
        # validate each question
        try:
            TemplateQuestion(**question)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))

        # further validate for extra requirements:
        # lang versions consistency: all questions should have same kinds of versions
        # qindex constraint: question index in ascending order
        if index == 0:
            lang_version_list = [
                v.get("lang") for v in question.get("questionLangVersions")
            ]
            lang_version_list.sort()

            qindex = question.get("questionIndex")
        else:
            tmp_lang_version_list = [
                v.get("lang") for v in question.get("questionLangVersions")
            ]
            tmp_lang_version_list.sort()
            if tmp_lang_version_list != lang_version_list:
                raise ValidationExceptionError(
                    "lang versions provided between questions are not consistent",
                )

            cur_qindex = question.get("questionIndex")
            if qindex < cur_qindex:
                qindex = cur_qindex
            else:
                raise ValidationExceptionError(
                    "questions should be in index-ascending order",
                )

    # validate question qindex tree dfs order
    error = questionTree.is_dfs_order(questions)
    if error:
        raise ValidationExceptionError(str(error))
    return None
