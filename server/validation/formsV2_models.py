from typing import Annotated, Literal, Union, Optional, List

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
    

class FormTemplateLang(CradleBaseModel):
    archived: bool
    classification: FormClassificationV2Response
    dateCreated: int = Field(default_factory=get_current_time),
    id: str
    questions: List[FormClassificationV2Response]
    version: str