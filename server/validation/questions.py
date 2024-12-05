from typing import List, Optional, Union

from pydantic import BaseModel, Field
from typing_extensions import Annotated

from enums import QRelationalEnum, QuestionTypeEnum


class MultipleChoiceOptionValidator(BaseModel):
    mcid: int
    opt: str

    """
    valid example:
    [
        {
            "mcid": 0,
            "opt": "abcd"
        },
        ... (maximum 5 answers)
    ]
    """


class AnswerValidator(BaseModel, extra="forbid"):
    comment: Optional[str] = None
    mcidArray: Optional[List[int]] = None
    number: Optional[Union[int, float]] = None
    text: Optional[str] = None

    """
    valid example (all fields, in real case only present one part of it):
    {
        "number": 5/5.0,
        "text": "a",
        "mcidArray":[0,1],
        "comment": "other opt"
    }
    """


class VisibleConditionValidator(BaseModel):
    answers: AnswerValidator
    qidx: int
    relation: QRelationalEnum

    class Config:
        use_enum_values = True

    """
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


class QuestionLangVersionValidator(BaseModel, extra="forbid"):
    lang: str
    mcOptions: Optional[List[MultipleChoiceOptionValidator]] = None
    questionText: str

    """
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


class TemplateQuestionValidator(QuestionBase, extra="forbid"):
    questionLangVersions: List[QuestionLangVersionValidator]
    isBlank: bool = True  # Set to True for template questions


class FormQuestionValidator(QuestionBase, extra="forbid"):
    questionText: str
    isBlank: bool = False  # Set to False for form questions
    hasCommentAttached: Optional[bool] = None
    id: Optional[str] = None
    mcOptions: Optional[List[MultipleChoiceOptionValidator]] = None
    answers: Optional[AnswerValidator] = None


class FormQuestionPutValidator(BaseModel):
    id: str
    answers: AnswerValidator
