from typing import List, Optional, Union

from pydantic import Field, model_validator
from typing_extensions import Self

from common.commonUtil import get_current_time
from validation import CradleBaseModel
from validation.formsV2_models import MultiLangText
from validation.workflow_models import (
    WorkflowActionModel,
    WorkflowClassificationModel,
    WorkflowCollectionModel,
    WorkflowInstanceModel,
    WorkflowInstanceStepModel,
    WorkflowTemplateModel,
    WorkflowTemplateStepModel,
)


class WorkflowClassificationUploadModel(WorkflowClassificationModel):
    id: Optional[str] = None


class WorkflowClassificationPatchModel(CradleBaseModel, extra="forbid"):
    id: Optional[str] = None
    name: Optional[Union[str, MultiLangText]] = None


class GetWorkflowTemplatesQuery(CradleBaseModel):
    """Query params for GET /workflow/templates."""

    archived: bool = Field(
        False, description="If true, include archived templates."
    )
    classification_id: Optional[str] = Field(
        None, description="Filter by classification ID."
    )


class GetWorkflowClassificationsQuery(CradleBaseModel):
    """Query params for GET /workflow/classifications."""
    pass


class WorkflowCollectionUploadModel(WorkflowCollectionModel):
    id: Optional[str] = None


class WorkflowTemplateUploadModel(WorkflowTemplateModel):
    id: Optional[str] = None
    name: Optional[str] = None
    classification: Optional[WorkflowClassificationUploadModel] = None


class WorkflowTemplatePatchBody(CradleBaseModel):
    id: Optional[str] = None
    description: Optional[str] = None
    archived: Optional[bool] = None
    starting_step_id: Optional[str] = None
    date_created: int = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    version: str  # A new version is required
    classification_id: Optional[str] = None
    classification: Optional[WorkflowClassificationModel] = None
    steps: Optional[list[WorkflowTemplateStepModel]] = None

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.date_created:
            raise ValueError("last_edited cannot be before date_created")
        return self


class WorkflowTemplateStepUploadModel(WorkflowTemplateStepModel):
    id: Optional[str] = None


class WorkflowInstancePatchModel(CradleBaseModel, extra="forbid"):
    """
    Patch model for updating a workflow instance.

    Defines the fields that clients may update. Fields managed by the
    backend are intentionally excluded to prevent clients from putting
    the workflow into an inconsistent state.
    """

    name: Optional[str] = None
    description: Optional[str] = None
    patient_id: Optional[str] = None


class WorkflowInstanceStepPatchModel(CradleBaseModel, extra="forbid"):
    """
    Patch model for updating a single workflow instance step.

    Defines the fields that clients may update. Fields managed by the
    backend are intentionally excluded to prevent clients from putting
    the workflow into an inconsistent state.
    """

    assigned_to: Optional[int] = None
    form_id: Optional[str] = None


class GetWorkflowInstanceStepsRequest(CradleBaseModel, extra="forbid"):
    workflow_instance_id: str


class GetWorkflowInstanceStepsResponse(CradleBaseModel, extra="forbid"):
    items: list[WorkflowInstanceStepModel]


class GetWorkflowInstancesResponse(CradleBaseModel, extra="forbid"):
    items: list[WorkflowInstanceModel]


class CreateWorkflowInstanceRequest(CradleBaseModel, extra="forbid"):
    workflow_template_id: str
    patient_id: str
    name: str
    description: str


class GetAvailableActionsResponse(CradleBaseModel):
    actions: list[WorkflowActionModel]


class ApplyActionRequest(CradleBaseModel):
    action: WorkflowActionModel


class OverrideCurrentStepRequest(CradleBaseModel):
    workflow_instance_step_id: str


# Workflow Variable Catalogue


class WorkflowVariableCatalogueItemModel(CradleBaseModel, extra="forbid"):
    """Single variable entry in the catalogue"""

    tag: str
    description: Optional[str] = None
    type: str
    namespace: Optional[str] = None
    collection_name: Optional[str] = None
    field_path: Optional[List[str]] = None
    is_computed: bool = False
    is_dynamic: bool = False


class GetWorkflowVariablesResponse(CradleBaseModel, extra="forbid"):
    variables: List[WorkflowVariableCatalogueItemModel]


class WorkflowVariableDetailModel(WorkflowVariableCatalogueItemModel):
    """Detail response for a single variable"""

    examples: Optional[List[str]] = None
