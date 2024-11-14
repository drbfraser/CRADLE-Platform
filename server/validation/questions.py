from typing import List, Optional, Union

from pydantic import BaseModel, Field, ValidationError
from typing_extensions import Annotated

from enums import QRelationalEnum, QuestionTypeEnum
from validation.validation_exception import ValidationExceptionError


class MultipleChoiceOptionValidator(BaseModel):
    mc_id: int
    opt: str


class Answer(BaseModel):
    comment: Optional[str] = None
    mc_id_array: Optional[List[int]] = None
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
    mc_options: Optional[List[MultipleChoiceOptionValidator]] = None
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
    form_template_id: Optional[str] = None

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
    mc_options: Optional[List[MultipleChoiceOptionValidator]] = None
    answers: Optional[Answer] = None
    form_template_id: Optional[str] = None

    class Config:
        extra = "forbid"


class FormQuestionPut(BaseModel):
    id: str
    answers: Answer


class AnswerValidator(BaseModel):
    comment: Optional[str] = None
    mc_id_array: Optional[List[int]] = None
    number: Optional[Union[int, float]] = None
    text: Optional[str] = None

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(question: dict):
        """
        Raises an error if the answer is invalid.

        :param question: the parent dict for answers

        valid example (all fields, in real case only present one part of it):
        {
            "number": 5/5.0,
            "text": "a",
            "mc_id_array":[0,1],
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
            AnswerValidator(**question[target])
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


class VisibleConditionValidator(BaseModel):
    answers: AnswerValidator
    question_index: int
    relation: QRelationalEnum

    @staticmethod
    def validate(question: dict):
        """
        Raises an error if the visible condition is invalid.

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
                VisibleConditionValidator(**visible_condition)
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


class QuestionLangVersionValidator(BaseModel):
    lang: str
    mc_options: Optional[List[MultipleChoiceOptionValidator]] = None
    question_text: str

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(question: dict):
        """
        Raises an error if the lang versions is invalid.

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
                QuestionLangVersionValidator(**question_lang_version)
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


class QuestionBase(BaseModel):
    question_index: Annotated[int, Field(strict=True, ge=0)]  # Non-negative index
    question_type: QuestionTypeEnum
    question_id: Optional[str] = None
    required: Optional[bool] = None
    allow_past_dates: Optional[bool] = None
    allow_future_dates: Optional[bool] = None
    units: Optional[str] = None
    visible_condition: Optional[List[VisibleConditionValidator]] = None
    num_min: Optional[Union[int, float]] = None
    num_max: Optional[Union[int, float]] = None
    string_max_length: Optional[int] = None
    category_index: Optional[int] = None
    string_max_lines: Optional[int] = None

    class Config:
        use_enum_values = True


class TemplateQuestionValidator(QuestionBase):
    question_lang_versions: List[QuestionLangVersionValidator]
    is_blank: bool = True  # Set to True for template questions

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(question: dict):
        """
        Raises an error if the question dict is not valid (after pre-process) when
        making template post request.

        :param question: question as a dict object
        """
        try:
            TemplateQuestionValidator(**question)
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


class FormQuestionValidator(QuestionBase):
    question_text: str
    is_blank: bool = False  # Set to False for form questions
    has_comment_attached: Optional[bool] = None
    id: Optional[str] = None
    mc_options: Optional[List[MultipleChoiceOptionValidator]] = None
    answers: Optional[AnswerValidator] = None

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(question: dict):
        """
        Raises an error if the question dict is not valid (after pre-process) when
        making /api/forms/responses POST request.

        :param question: question as a dict object
        """
        try:
            FormQuestionValidator(**question)
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


class FormQuestionPutValidator(BaseModel):
    id: str
    answers: AnswerValidator

    @staticmethod
    def validate(question: dict):
        """
        Raises an error if the question dict is not valid when making
        /api/forms/responses PUT request. Else, returns None.

        :param question: question as a dict object
        """
        try:
            FormQuestionPutValidator(**question)
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


def check_target_not_null(target, q: dict) -> Optional[str]:
    """
    Returns an error if the target key has value null.
    Else, returns None.
    """
    if target in q and q.get(target) is None:
        return f"Can not provide key={target} with null value"
    return None
