from typing import Any, List, Optional

from pydantic import Field

from common.api_utils import (
    FormTemplateIdPath,
)
from common.commonUtil import get_current_time
from enums import QuestionTypeEnum
from validation import CradleBaseModel


class FormTemplateV2Response(CradleBaseModel):
    """Response model for a single form template V2"""

    id: str
    form_classification_id: str
    version: int
    archived: bool
    is_latest: bool
    date_created: int


class FormTemplateListV2Response(CradleBaseModel):
    """Response model for list of form templates V2"""

    templates: list[FormTemplateV2Response]


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


class LangVersionResponse(CradleBaseModel):
    id: Optional[int] = None
    lang: str
    questionId: str
    questionText: str


class QuestionResponse(CradleBaseModel):
    id: str
    formTemplateId: str
    questionType: QuestionTypeEnum
    order: int
    questionText: str = ""
    categoryIndex: Optional[int] = None
    required: bool
    hasCommentAttached: bool
    allowFutureDates: bool
    allowPastDates: bool
    visibleCondition: List[Any] = []
    mcOptions: List[str] = []
    langVersions: List[LangVersionResponse]


class FormClassification(CradleBaseModel):
    id: str
    name: str


class FormTemplateResponse(CradleBaseModel):
    id: str
    archived: bool
    classification: FormClassification
    dateCreated: int
    version: str
    questions: List[QuestionResponse]


class FormTemplateVersionPath(FormTemplateIdPath):
    version: str = Field(..., description="Form Template version.")


class FormTemplateModel(CradleBaseModel, extra="forbid"):
    id: str
    version: str
    date_created: int = Field(default_factory=get_current_time)
    form_classification_id: Optional[str] = None
    archived: bool = False

    model_config = dict(
        openapi_extra={
            "description": "Form Template object",
        }
    )


class ArchiveFormTemplateQuery(CradleBaseModel):
    archived: bool = Field(
        True,
        description="If true, the Form Template will be archived. If false, the Form Template will be unarchived.",
    )
