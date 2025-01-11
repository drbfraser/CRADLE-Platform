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
    """
    valid example (all fields, in real case only present one part of it):
    {
        "number": 5.0,
        "text": "a",
        "mc_id_array": [0, 1],
        "comment": "other option"
    }
    TODO: Refactor this into separate classes. These shouldn't all be in
        one class if only one is expected to be present at a time.
    """

    comment: Optional[str] = None
    mc_id_array: Optional[List[int]] = None
    number: Optional[Union[int, float]] = None
    text: Optional[str] = None


class VisibleConditionValidator(CradleBaseModel, use_enum_values=True):
    """
    Valid example:
        {
            "question_index": 1,
            "relation": "EQUAL_TO",
            "answers": {
                "number": 5
            }
        }
    TODO: Figure out how this works and write an explanation of it.
    """

    question_index: int
    answers: AnswerValidator
    relation: QRelationalEnum


class QuestionLangVersionValidator(CradleBaseModel, extra="forbid"):
    """
    valid example:
    {
        "lang": "English",
        "question_text": "How is the patient's condition?",
        "mc_options": [
            {
                "mc_id": 0,
                "opt": "Good"
            },
            {
                "mc_id": 1,
                "opt": "Bad"
            }
        ],
    },

    """

    lang: str
    question_text: str
    mc_options: Optional[List[MultipleChoiceOptionValidator]] = None


class QuestionBase(CradleBaseModel, use_enum_values=True):
    id: Optional[str] = None
    question_index: Annotated[int, Field(strict=True, ge=0)]  # Non-negative index
    question_type: QuestionTypeEnum
    required: Optional[bool] = None
    allow_past_dates: Optional[bool] = True
    allow_future_dates: Optional[bool] = True
    units: Optional[str] = None
    visible_condition: Optional[List[VisibleConditionValidator]] = []
    num_min: Optional[Union[int, float]] = None
    num_max: Optional[Union[int, float]] = None
    string_max_length: Optional[int] = None
    category_index: Optional[int] = None
    string_max_lines: Optional[int] = None


class TemplateQuestionModel(QuestionBase, extra="forbid"):
    question_lang_versions: List[QuestionLangVersionValidator]
    is_blank: bool = True  # Set to True for template questions


class FormQuestionValidator(QuestionBase, extra="forbid"):
    question_text: str
    is_blank: bool = False  # Set to False for form questions
    has_comment_attached: Optional[bool] = False
    mc_options: Optional[List[MultipleChoiceOptionValidator]] = []
    answers: Optional[AnswerValidator] = None


class FormQuestionPutValidator(CradleBaseModel):
    id: str
    answers: AnswerValidator
