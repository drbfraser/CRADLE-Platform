from pydantic import BaseModel, Field, ValidationError
from typing import List, Optional, Union
from typing_extensions import Annotated

from validation.validation_exception import ValidationExceptionError

from enums import QRelationalEnum, QuestionTypeEnum


class MultipleChoiceOption(BaseModel):
    mcid: int
    opt: str


class Answer(BaseModel):
    comment: Optional[str] = None
    mcidArray: Optional[List[int]] = None
    number: Optional[Union[int, float]] = None
    text: Optional[str] = None


class VisibleCondition(BaseModel):
    answers: Answer
    qidx: int
    relation: QRelationalEnum


class QuestionLangVersion(BaseModel):
    lang: str
    mcOptions: Optional[List[MultipleChoiceOption]] = None
    questionText: str


class TemplateQuestion(BaseModel):
    questionIndex: Annotated[int, Field(strict=True, ge=0)]  # Non-negative index
    questionType: QuestionTypeEnum
    questionLangVersions: List[QuestionLangVersion]
    isBlank: bool = True  # Set to true for template questions
    questionId: Optional[str] = None
    required: Optional[bool] = None
    allowPastDates: Optional[bool] = None
    allowFutureDates: Optional[bool] = None
    units: Optional[str] = None
    visibleCondition: Optional[List[VisibleCondition]] = None
    numMin: Optional[Union[int, float]] = None
    numMax: Optional[Union[int, float]] = None
    stringMaxLength: Optional[int] = None
    categoryIndex: Optional[int] = None
    stringMaxLines: Optional[int] = None


class FormQuestion(BaseModel):
    id: Optional[str] = None
    questionIndex: Annotated[int, Field(strict=True, ge=0)]  # Non-negative index
    questionText: str
    questionType: QuestionTypeEnum
    isBlank: bool = False  # Set to False for form questions
    hasCommentAttached: Optional[bool] = None
    required: Optional[bool] = None
    allowPastDates: Optional[bool] = None
    allowFutureDates: Optional[bool] = None
    units: Optional[str] = None
    visibleCondition: Optional[List[VisibleCondition]] = None
    mcOptions: Optional[List[MultipleChoiceOption]] = None
    numMin: Optional[Union[int, float]] = None
    numMax: Optional[Union[int, float]] = None
    stringMaxLength: Optional[int] = None
    categoryIndex: Optional[int] = None
    answers: Optional[Answer] = None
    stringMaxLines: Optional[int] = None


class FormQuestionPut(BaseModel):
    id: str
    answers: Answer


def check_target_not_null(target, q: dict) -> Optional[str]:
    """
    Returns an error if the target key has value null.
    Else, returns None.
    """
    if target in q and q.get(target) is None:
        return f"Can not provide key={target} with null value"
    return None


def validate_mc_options(q: dict) -> Optional[str]:
    """
    Returns an error if the mcOptions is invalid.
    Else, returns None.

    :param q: the parent dict for mcOptions

    valid example:
    [
        {
            "mcid": 0,
            "opt": "abcd"
        },
        ... (maximum 5 answers)
    ]
    """
    target = "mcOptions"

    if target not in q:
        return None

    error = check_target_not_null(target, q)
    if error:
        return error

    try:
        mcopts = q[target]
        for opt in mcopts:
            MultipleChoiceOption(**opt)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return None


def validate_answers(q: dict) -> Optional[str]:
    """
    Returns an error if the answer is invalid.
    Else, returns None.

    :param q: the parent dict for answers

    valid example (all fields, in real case only present one part of it):
    {
        "number": 5/5.0,
        "text": "a",
        "mcidArray":[0,1],
        "comment": "other opt"
    }
    """
    target = "answers"

    if target not in q:
        return None

    error = check_target_not_null(target, q)
    if error:
        return error

    try:
        Answer(**q[target])
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return None


def validate_visible_condition(q: dict) -> Optional[str]:
    """
    Returns an error if the visible condition is invalid
    . Else, returns None.

    :param q: the parent dict for visible condition

    valid example:
    [
        {
            "qidx": 1,
            "relation": "EQUAL_TO",
            "answers": {
                "number": 5
            }
        },...
    ]
    """
    target = "visibleCondition"

    if target not in q:
        return None

    error = check_target_not_null(target, q)
    if error:
        return error

    try:
        visible_conditions = q[target]
        for visible_condition in visible_conditions:
            VisibleCondition(**visible_condition)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return None


def validate_lang_versions(q: dict) -> Optional[str]:
    """
    Returns an error if the lang versions is invalid.
    Else, returns None.

    :param q: the parent dict for visible condition

    valid example:
    [
        {
           "lang": "English",
           "questionText": "How the patient's condition?",
            "mcOptions": [
                {
                    "mcid":0,
                    "opt": "Decent"
                }
            ],
        },

    ]
    """
    target = "questionLangVersions"

    if target not in q:
        return None

    error = check_target_not_null(target, q)
    if error:
        return error

    try:
        question_lang_versions = q[target]
        for question_lang_version in question_lang_versions:
            QuestionLangVersion(**question_lang_version)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return None


def validate_template_question_post(q: dict) -> Optional[str]:
    """
    Returns an error message if the question dict is not valid (after pre-process) when
    making template post request. Else, returns None.

    :param q: question as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    TemplateQuestion._previous_index = None
    try:
        TemplateQuestion(**q)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return None


def validate_form_question_post(q: dict) -> Optional[str]:
    """
    Returns an error message if the question dict is not valid (after pre-process) when
    making /api/forms/responses POST request. Else, returns None.

    :param q: question as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """

    try:
        FormQuestion(**q)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return None


def validate_form_question_put(q: dict) -> Optional[str]:
    """
    Returns an error message if the question dict is not valid when making
    /api/forms/responses PUT request. Else, returns None.

    :param q: question as a dict object

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    try:
        FormQuestionPut(**q)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
    return None
