from typing import List, Optional, Union

from pydantic import BaseModel, Field, ValidationError
from typing_extensions import Annotated

from enums import QRelationalEnum, QuestionTypeEnum
from validation.validation_exception import ValidationExceptionError


class MultipleChoiceOptionValidator(BaseModel):
    mcid: int
    opt: str

    @staticmethod
    def validate(q: dict):
        """
        Raises an error if the mcOptions is invalid.

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
            return

        error = check_target_not_null(target, q)
        if error:
            raise ValidationExceptionError(str(error))

        try:
            mcopts = q[target]
            for opt in mcopts:
                MultipleChoiceOptionValidator(**opt)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
        return


class AnswerValidator(BaseModel):
    comment: Optional[str] = None
    mcidArray: Optional[List[int]] = None
    number: Optional[Union[int, float]] = None
    text: Optional[str] = None

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(q: dict):
        """
        Raises an error if the answer is invalid.

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
            return

        error = check_target_not_null(target, q)
        if error:
            raise ValidationExceptionError(str(error))

        try:
            AnswerValidator(**q[target])
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
        return


class VisibleConditionValidator(BaseModel):
    answers: AnswerValidator
    qidx: int
    relation: QRelationalEnum

    class Config:
        use_enum_values = True

    @staticmethod
    def validate(q: dict):
        """
        Raises an error if the visible condition is invalid.

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
            return

        error = check_target_not_null(target, q)
        if error:
            raise ValidationExceptionError(str(error))

        try:
            visible_conditions = q[target]
            for visible_condition in visible_conditions:
                VisibleConditionValidator(**visible_condition)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
        return


class QuestionLangVersionValidator(BaseModel):
    lang: str
    mcOptions: Optional[List[MultipleChoiceOptionValidator]] = None
    questionText: str

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(q: dict):
        """
        Raises an error if the lang versions is invalid.

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
            return

        error = check_target_not_null(target, q)
        if error:
            raise ValidationExceptionError(str(error))

        try:
            question_lang_versions = q[target]
            for question_lang_version in question_lang_versions:
                QuestionLangVersionValidator(**question_lang_version)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
        return


class QuestionBase(BaseModel):
    questionIndex: Annotated[int, Field(strict=True, ge=0)]  # Non-negative index
    questionType: QuestionTypeEnum
    questionId: Optional[str] = None
    required: Optional[bool] = None
    allowPastDates: Optional[bool] = None
    allowFutureDates: Optional[bool] = None
    units: Optional[str] = None
    visibleCondition: Optional[List[VisibleConditionValidator]] = None
    numMin: Optional[Union[int, float]] = None
    numMax: Optional[Union[int, float]] = None
    stringMaxLength: Optional[int] = None
    categoryIndex: Optional[int] = None
    stringMaxLines: Optional[int] = None

    class Config:
        use_enum_values = True


class TemplateQuestionValidator(QuestionBase):
    questionLangVersions: List[QuestionLangVersionValidator]
    isBlank: bool = True  # Set to True for template questions

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(q: dict):
        """
        Raises an error if the question dict is not valid (after pre-process) when
        making template post request.

        :param q: question as a dict object
        """
        try:
            TemplateQuestionValidator(**q)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


class FormQuestionValidator(QuestionBase):
    questionText: str
    isBlank: bool = False  # Set to False for form questions
    hasCommentAttached: Optional[bool] = None
    id: Optional[str] = None
    mcOptions: Optional[List[MultipleChoiceOptionValidator]] = None
    answers: Optional[AnswerValidator] = None

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(q: dict):
        """
        Raises an error if the question dict is not valid (after pre-process) when
        making /api/forms/responses POST request.

        :param q: question as a dict object
        """
        try:
            FormQuestionValidator(**q)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


class FormQuestionPutValidator(BaseModel):
    id: str
    answers: AnswerValidator

    @staticmethod
    def validate(q: dict):
        """
        Raises an error if the question dict is not valid when making
        /api/forms/responses PUT request. Else, returns None.

        :param q: question as a dict object
        """
        try:
            FormQuestionPutValidator(**q)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


def check_target_not_null(target, q: dict) -> Optional[str]:
    """
    Returns an error if the target key has value null.
    Else, returns None.
    """
    if target in q and q.get(target) is None:
        return f"Can not provide key={target} with null value"
    return None
