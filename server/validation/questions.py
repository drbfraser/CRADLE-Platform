from typing import List, Optional, Union

from pydantic import Field
from typing_extensions import Annotated

from enums import QRelationalEnum, QuestionTypeEnum
from validation import CradleBaseModel


class MultipleChoiceOptionValidator(CradleBaseModel):
    mc_id: int
    opt: str
    """
    valid example:
    [
        {
            "mc_id": 0,
            "opt": "abcd"
        },
        ... (maximum 5 answers)
    ]
    """


class AnswerValidator(CradleBaseModel, extra="forbid"):
    comment: Optional[str] = None
    mc_id_array: Optional[List[int]] = None
    number: Optional[Union[int, float]] = None
    text: Optional[str] = None

    """
    valid example (all fields, in real case only present one part of it):
    {
        "number": 5/5.0,
        "text": "a",
        "mc_id_array":[0,1],
        "comment": "other opt"
    }
    """


class VisibleConditionValidator(CradleBaseModel, use_enum_values=True):
    answers: AnswerValidator
    question_index: int
    relation: QRelationalEnum

    """
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


class QuestionLangVersionValidator(CradleBaseModel, extra="forbid"):
    lang: str
    mc_options: Optional[List[MultipleChoiceOptionValidator]] = None
    question_text: str

    """
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


class QuestionBase(CradleBaseModel, use_enum_values=True):
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


class TemplateQuestionValidator(QuestionBase, extra="forbid"):
    question_lang_versions: List[QuestionLangVersionValidator]
    is_blank: bool = True  # Set to True for template questions


class FormQuestionValidator(QuestionBase, extra="forbid"):
    question_text: str
    is_blank: bool = False  # Set to False for form questions
    has_comment_attached: Optional[bool] = None
    id: Optional[str] = None
    mc_options: Optional[List[MultipleChoiceOptionValidator]] = None
    answers: Optional[AnswerValidator] = None


class FormQuestionPutValidator(CradleBaseModel):
    id: str
    answers: AnswerValidator
