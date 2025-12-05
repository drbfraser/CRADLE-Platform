from typing import List, Optional, Union

from pydantic import Field, RootModel, model_validator
from typing_extensions import Self

from common.commonUtil import get_current_time
from enums import QRelationalEnum, QuestionTypeEnum
from validation import CradleBaseModel


class FormTemplateIdPath(CradleBaseModel):
    form_template_id: str


class FormTemplateV2Response(CradleBaseModel):
    """Response model for a single shallow form template V2, without any questions"""

    id: str
    form_classification_id: str
    version: int
    archived: bool
    name: str
    date_created: int = Field(default_factory=get_current_time)

    model_config = dict(
        openapi_extra={
            "description": "Form Template object",
        }
    )


class FormTemplateListV2Response(CradleBaseModel):
    """Response model for list of form templates V2"""

    templates: list[FormTemplateV2Response]


class FormTemplateLangList(CradleBaseModel):
    """Response model for list of available form templates languages"""

    langVersions: list[str]


class GetAllFormTemplatesV2Query(CradleBaseModel):
    include_archived: bool = Field(
        False, description="If true, archived Form Templates will be included."
    )
    lang: str = Field("English", description="Language code for template names.")


class GetFormTemplateV2Query(CradleBaseModel):
    lang: Optional[str] = Field(
        None,
        description="Language code for translations. If not provided, returns string_ids.",
    )


class LangVersion(CradleBaseModel):
    string_id: str
    lang: str = Field("English")
    text: str


class MultiLangText(RootModel[dict[str, str]]):
    """
    Represents multilingual text like:
    {"english": "Hello", "french": "Bonjour"}
    """


class AnswerTypeNumber(CradleBaseModel):
    number: float


class AnswerTypeText(CradleBaseModel):
    text: str


class AnswerTypeMCId(CradleBaseModel):
    mc_id_array: List[int]


class AnswerTypeDate(CradleBaseModel):
    date: str


AnswerType = Union[
    AnswerTypeNumber,
    AnswerTypeText,
    AnswerTypeMCId,
    AnswerTypeDate,
]


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
    """

    question_index: int
    answers: AnswerType
    relation: QRelationalEnum


class MCOption(CradleBaseModel):
    string_id: Optional[str] = None
    translations: MultiLangText

    class Config:
        extra = "forbid"


class FormTemplateQuestion(CradleBaseModel):
    id: str
    form_template_id: str
    question_type: QuestionTypeEnum
    order: int

    question_text: MultiLangText
    question_string_id: Optional[str] = None

    category_index: Optional[int] = None
    required: bool
    has_comment_attached: Optional[bool] = False
    allow_future_dates: Optional[bool] = None
    allow_past_dates: Optional[bool] = None

    visible_condition: Optional[list[VisibleCondition]] = []

    string_max_length: Optional[int] = None
    string_max_lines: Optional[int] = None

    num_min: Optional[float] = None
    num_max: Optional[float] = None
    units: Optional[str] = None

    user_question_id: Optional[str] = None

    mc_options: Optional[List[MCOption]] = None


class FormClassification(CradleBaseModel):
    id: Optional[str] = None
    name: MultiLangText
    name_string_id: Optional[str] = None


class FormClassificationList(CradleBaseModel):
    classifications: List[FormClassification]


class FormTemplate(CradleBaseModel):
    id: str
    version: int
    archived: Optional[bool] = False
    classification: FormClassification
    date_created: int = Field(default_factory=get_current_time)
    questions: Optional[List[FormTemplateQuestion]] = []


class FormTemplateList(RootModel[list[FormTemplate]]):
    """
    List response for getting all form templates under a form classification
    """


class FormTemplateVersionPath(CradleBaseModel):
    form_template_id: str
    version: str = Field(..., description="Form Template version.")


class ArchiveFormTemplateQuery(CradleBaseModel):
    archived: bool = Field(
        True,
        description="If true, the Form Template will be archived. If false, the Form Template will be unarchived.",
    )


class FormTemplateUploadQuestion(FormTemplateQuestion):
    id: Optional[str] = None
    form_template_id: Optional[str] = None


class FormTemplateUploadRequest(FormTemplate):
    id: Optional[str] = None
    version: Optional[int] = 1
    questions: List[FormTemplateUploadQuestion]


class NumberAnswer(AnswerTypeNumber):
    comment: Optional[str] = None


class TextAnswer(AnswerTypeText):
    comment: Optional[str] = None


class MCAnswer(AnswerTypeMCId):
    comment: Optional[str] = None


class DateAnswer(AnswerTypeDate):
    comment: Optional[str] = None


AnswerValue = Union[
    NumberAnswer,
    TextAnswer,
    MCAnswer,
    DateAnswer,
]


class FormAnswer(CradleBaseModel, extra="forbid"):
    """Model representing a submitted answer in a FormSubmission"""

    id: Optional[str] = None
    question_id: str
    form_submission_id: Optional[str] = None
    answer: AnswerValue


class FormSubmissionResponse(CradleBaseModel, extra="forbid"):
    """Model representing a submitted Form"""

    id: str
    form_template_id: str
    patient_id: str
    user_id: int
    date_submitted: int
    last_edited: int
    lang: str

    @model_validator(mode="after")
    def validate_date_sequence(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.date_submitted:
            raise ValueError(
                "last_edited cannot be before date_submitted.",
            )
        return self


class AnswerWithQuestion(FormAnswer):
    question_type: QuestionTypeEnum
    question_text: str
    mc_options: List[str]
    order: int


class CreateFormSubmissionRequest(CradleBaseModel):
    """Request body for creating a new form submission"""

    id: Optional[str] = None
    form_template_id: str
    patient_id: str
    user_id: int
    lang: str = "English"
    answers: list[FormAnswer]


class FormSubmission(FormSubmissionResponse):
    id: Optional[str] = None
    date_submitted: Optional[int] = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    answers: Optional[List[AnswerWithQuestion]]


class FormIdPath(CradleBaseModel):
    form_submission_id: str


class UpdateFormRequestBody(CradleBaseModel):
    """
    Request body for updating a submitted Form
    """

    answers: list[FormAnswer]
