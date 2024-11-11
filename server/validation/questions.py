from typing import List, Optional, Union

from pydantic import BaseModel, Field, ValidationError
from typing_extensions import Annotated

from enums import QRelationalEnum, QuestionTypeEnum
from validation.validation_exception import ValidationExceptionError


class MultipleChoiceOption(BaseModel):
    mc_id: int
    opt: str


class Answer(BaseModel):
    comment: Optional[str] = None
    mc_id_aArray: Optional[List[int]] = None
    number: Optional[Union[int, float]] = None
    text: Optional[str] = None

    class Config:
        extra = "forbid"


class VisibleCondition(BaseModel):
    answers: Answer
    question_index: int
    relation: QRelationalEnum


class QuestionLangVersion(BaseModel):
    lang: str
    mc_options: Optional[List[MultipleChoiceOption]] = None
    question_text: str

    class Config:
        extra = "forbid"


class TemplateQuestion(BaseModel):
    question_index: Annotated[int, Field(strict=True, ge=0)]  # Non-negative index
    question_type: QuestionTypeEnum
    question_lang_versions: List[QuestionLangVersion]
    is_blank: bool = True  # Set to true for template questions
    question_id: Optional[str] = None
    required: Optional[bool] = None
    allow_past_dates: Optional[bool] = None
    allow_future_dates: Optional[bool] = None
    units: Optional[str] = None
    visible_condition: Optional[List[VisibleCondition]] = None
    num_min: Optional[Union[int, float]] = None
    num_max: Optional[Union[int, float]] = None
    string_max_length: Optional[int] = None
    category_index: Optional[int] = None
    string_max_lines: Optional[int] = None

    class Config:
        extra = "forbid"


class FormQuestion(BaseModel):
    question_index: Annotated[int, Field(strict=True, ge=0)]  # Non-negative index
    question_type: QuestionTypeEnum
    question_text: str
    is_blank: bool = False  # Set to False for form questions
    question_id: Optional[str] = None
    required: Optional[bool] = None
    allow_past_dates: Optional[bool] = None
    allow_future_dates: Optional[bool] = None
    units: Optional[str] = None
    visible_condition: Optional[List[VisibleCondition]] = None
    num_min: Optional[Union[int, float]] = None
    num_max: Optional[Union[int, float]] = None
    string_max_length: Optional[int] = None
    category_index: Optional[int] = None
    string_max_lines: Optional[int] = None
    has_comment_attached: Optional[bool] = None
    id: Optional[str] = None
    mc_options: Optional[List[MultipleChoiceOption]] = None
    answers: Optional[Answer] = None

    class Config:
        extra = "forbid"


class FormQuestionPut(BaseModel):
    id: str
    answers: Answer


def check_target_not_null(target, question: dict) -> Optional[str]:
    """
    Returns an error if the target key has value null.
    Else, returns None.
    """
    if target in question and question.get(target) is None:
        return f"Can not provide key={target} with null value"
    return None


def validate_mc_options(question: dict):
    """
    Returns an error if the mc_options is invalid.
    Else, returns None.

    :param question: the parent dict for mc_options

    valid example:
    [
        {
            "mc_id": 0,
            "opt": "abcd"
        },
        ... (maximum 5 answers)
    ]
    """
    target = "mc_options"

    if target not in question:
        return

    error = check_target_not_null(target, question)
    if error:
        raise ValidationExceptionError(str(error))

    try:
        mc_options = question[target]
        for opt in mc_options:
            MultipleChoiceOption(**opt)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return


def validate_answers(question: dict):
    """
    Returns an error if the answer is invalid.
    Else, returns None.

    :param question: the parent dict for answers

    valid example (all fields, in real case only present one part of it):
    {
        "number": 5/5.0,
        "text": "a",
        "mc_id_aArray":[0,1],
        "comment": "other opt"
    }
    """
    target = "answers"

    if target not in question:
        return

    error = check_target_not_null(target, question)
    if error:
        raise ValidationExceptionError(str(error))

    try:
        Answer(**question[target])
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return


def validate_visible_condition(question: dict):
    """
    Returns an error if the visible condition is invalid
    . Else, returns None.

    :param question: the parent dict for visible condition

    valid example:
    [
        {
            "question_index": 1,
            "relation": "EQUAL_TO",
            "answers": {
                "number": 5
            }
        },...
    ]
    """
    target = "visible_condition"

    if target not in question:
        return

    error = check_target_not_null(target, question)
    if error:
        raise ValidationExceptionError(str(error))

    try:
        visible_conditions = question[target]
        for visible_condition in visible_conditions:
            VisibleCondition(**visible_condition)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return


def validate_lang_versions(question: dict):
    """
    Returns an error if the lang versions is invalid.
    Else, returns None.

    :param question: the parent dict for visible condition

    valid example:
    [
        {
           "lang": "English",
           "question_text": "How the patient's condition?",
            "mc_options": [
                {
                    "mc_id":0,
                    "opt": "Decent"
                }
            ],
        },

    ]
    """
    target = "question_lang_versions"

    if target not in question:
        return

    error = check_target_not_null(target, question)
    if error:
        raise ValidationExceptionError(str(error))

    try:
        question_lang_versions = question[target]
        for question_lang_version in question_lang_versions:
            QuestionLangVersion(**question_lang_version)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return


def validate_template_question_post(question: dict):
    """
    Returns an error message if the question dict is not valid (after pre-process) when
    making template post request. Else, returns None.

    :param question: question as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    try:
        TemplateQuestion(**question)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))


def validate_form_question_post(question: dict):
    """
    Returns an error message if the question dict is not valid (after pre-process) when
    making /api/forms/responses POST request. Else, returns None.

    :param question: question as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    try:
        FormQuestion(**question)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))


def validate_form_question_put(question: dict):
    """
    Returns an error message if the question dict is not valid when making
    /api/forms/responses PUT request. Else, returns None.

    :param question: question as a dict object

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    try:
        FormQuestionPut(**question)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
