from typing import Optional, Union

from pydantic import Field, model_validator
from typing_extensions import Annotated, Self

from enums import QRelationalEnum, QuestionTypeEnum
from validation import CradleBaseModel


class MultipleChoiceOption(CradleBaseModel):
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


class Answer(CradleBaseModel, extra="forbid"):
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
    mc_id_array: Optional[list[int]] = None
    number: Optional[Union[int, float]] = None
    text: Optional[str] = None


class VisibleCondition(CradleBaseModel, use_enum_values=True):
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
    answers: Answer
    relation: QRelationalEnum


class QuestionLangVersionModel(CradleBaseModel, extra="forbid"):
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

    question_id: Optional[str] = None  # Foreign Key to parent Question
    lang: str
    question_text: str
    mc_options: Optional[list[MultipleChoiceOption]] = None


class QuestionBase(CradleBaseModel, use_enum_values=True):
    id: Optional[str] = None
    question_index: Annotated[int, Field(strict=True, ge=0)]  # Non-negative index
    question_type: QuestionTypeEnum
    required: Optional[bool] = None
    allow_past_dates: Optional[bool] = True
    allow_future_dates: Optional[bool] = True
    units: Optional[str] = None
    visible_condition: Optional[list[VisibleCondition]] = []
    num_min: Optional[Union[int, float]] = None
    num_max: Optional[Union[int, float]] = None
    string_max_length: Optional[int] = None
    category_index: Optional[int] = None
    string_max_lines: Optional[int] = None
    form_template_id: Optional[str] = None


class TemplateQuestion(QuestionBase, extra="forbid"):
    lang_versions: list[QuestionLangVersionModel]
    is_blank: bool = True  # Set to True for template questions

    @model_validator(mode="after")
    def set_lang_version_foreign_keys(self) -> Self:
        if len(self.lang_versions) < 1:
            raise ValueError("lang_versions cannot be empty")
        for lang_version in self.lang_versions:
            lang_version.question_id = self.id
        return self


class FormQuestion(QuestionBase, extra="forbid"):
    question_text: str
    is_blank: bool = False  # Set to False for form questions
    has_comment_attached: Optional[bool] = False
    mc_options: Optional[list[MultipleChoiceOption]] = []
    answers: Optional[Answer] = None

    @model_validator(mode="after")
    def validate_numeric_constraints(self) -> Self:
        """
        Ensures that if the question type is INTEGER or FLOAT:
        - `num_min` and `num_max` are correctly defined
        - `num_min` is less than or equal to `num_max`
        - The question has valid units if applicable
        """
        if self.question_type in [QuestionTypeEnum.INTEGER, QuestionTypeEnum.FLOAT]:
            if self.num_min is not None and self.num_max is not None:
                if self.num_min > self.num_max:
                    raise ValueError(f"num_min ({self.num_min}) cannot be greater than num_max ({self.num_max}).")
            
            if self.units and not isinstance(self.units, str):
                raise ValueError("Units must be a valid string.")

        return self


class UpdateFormQuestion(CradleBaseModel):
    id: str
    answers: Answer

    @model_validator(mode="after")
    def validate_number_range(self) -> Self:
        """
        Ensures that the updated answer respects the question's number constraints.
        """
        if self.answers.number is not None:
            question = crud.read(FormQuestion, id=self.id)
            if question and question.num_min is not None and self.answers.number < question.num_min:
                raise ValueError(f"Answer value {self.answers.number} is below the minimum allowed value {question.num_min}.")

            if question and question.num_max is not None and self.answers.number > question.num_max:
                raise ValueError(f"Answer value {self.answers.number} exceeds the maximum allowed value {question.num_max}.")

        return self
