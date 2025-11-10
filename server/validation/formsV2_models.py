from typing import Annotated, Literal, Union, Optional, List, Any

from pydantic import Field, RootModel
from common.commonUtil import get_current_time

from enums import QRelationalEnum, QuestionTypeEnum
from validation import CradleBaseModel

class FormTemplateV2Response(CradleBaseModel):
    """Response model for a single form template V2"""
    id: str
    form_classification_id: str
    version: int
    archived: bool
    is_latest: bool
    date_created: int
    questions: Optional[list] = None


class FormTemplateListV2Response(CradleBaseModel):
    """Response model for list of form templates V2"""
    templates: list[FormTemplateV2Response]


class FormClassificationV2Response(CradleBaseModel):
    """Response model for form classification V2"""
    id: str
    name_string_id: str
    name: Optional[str] = None
    templates: Optional[list[FormTemplateV2Response]] = None


class GetAllFormTemplatesV2Query(CradleBaseModel):
    include_archived: bool = Field(
        False, description="If true, archived Form Templates will be included."
    )
    lang: str = Field(
        "English", description="Language code for template names."
    )


class GetFormTemplateV2Query(CradleBaseModel):
    lang: Optional[str] = Field(
        None, description="Language code for translations. If not provided, returns string_ids."
    )
    

class LangVersion(CradleBaseModel):
    string_id: str
    lang: str = Field("English")
    text: str


class FormQuestion(CradleBaseModel):
    id: str
    allowFutureDates: bool
    allowPastDates: bool
    formTemplateId: str
    hasCommentAttached: bool
    isBlank: bool
    langVersions: List[LangVersion]
    mcOptions: List
    questionIndex: int
    questionType: QuestionTypeEnum
    required: bool
    visibleCondition: List


class LangVersionResponse(CradleBaseModel):
    id: Optional[int] = None
    lang: str
    questionId: str
    questionText: str


class QuestionResponse(CradleBaseModel):
    id: str
    formTemplateId: str
    questionType: str
    questionIndex: int
    questionText: str = ""
    categoryIndex: Optional[int] = None
    required: bool
    hasCommentAttached: bool
    allowFutureDates: bool
    allowPastDates: bool
    visibleCondition: List[Any] = []
    mcOptions: List[Any] = []
    langVersions: List[LangVersionResponse]
    isBlank: bool = True
    answers: dict = {}


class ClassificationResponse(CradleBaseModel):
    id: str
    name: str


class FormTemplateResponse(CradleBaseModel):
    id: str
    archived: bool
    classification: ClassificationResponse
    formClassificationId: str
    dateCreated: int
    version: str
    questions: List[QuestionResponse]