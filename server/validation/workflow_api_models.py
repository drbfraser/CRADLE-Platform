from typing import Any, Optional

from pydantic import Field, model_validator
from typing_extensions import Self

from common.commonUtil import get_current_time
from enums import WorkflowInstanceDataFieldTypeEnum
from validation import CradleBaseModel
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
    name: Optional[str] = None


class WorkflowCollectionUploadModel(WorkflowCollectionModel):
    id: Optional[str] = None


class WorkflowTemplateUploadModel(WorkflowTemplateModel):
    id: Optional[str] = None
    version: Optional[str] = (
        None  # Version is optional on upload to allow for auto-generation if not provided
    )


class WorkflowTemplatePatchBody(CradleBaseModel):
    id: Optional[str] = None
    description: Optional[str] = None
    archived: Optional[bool] = None
    starting_step_id: Optional[str] = None
    date_created: int = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    version: Optional[str] = None
    classification_id: Optional[str] = None
    classification: Optional[WorkflowClassificationModel] = None
    steps: Optional[list[WorkflowTemplateStepModel]] = None

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        """Raise if last_edited is before date_created."""
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
    status: Optional[str] = None


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
    name: Optional[str] = None
    description: Optional[str] = None


class GetAvailableActionsResponse(CradleBaseModel):
    actions: list[WorkflowActionModel]


class ApplyActionRequest(CradleBaseModel):
    action: WorkflowActionModel


class OverrideCurrentStepRequest(CradleBaseModel):
    workflow_instance_step_id: str


class AdvanceWorkflowRequest(CradleBaseModel):
    target_template_step_id: Optional[str] = None


class WorkflowInstanceDataUpsertItem(CradleBaseModel, extra="forbid"):
    """One dynamic field to store on a workflow instance (``workflow_instance_data``)."""

    field_tag: str
    field_type: WorkflowInstanceDataFieldTypeEnum
    value: Optional[Any] = None


class SetWorkflowInstanceDataRequest(CradleBaseModel, extra="forbid"):
    items: list[WorkflowInstanceDataUpsertItem]


class WorkflowInstanceDataRowModel(CradleBaseModel, extra="forbid"):
    id: str
    workflow_instance_id: str
    field_tag: str
    field_type: str
    value: Optional[Any] = None
    date_created: int
    last_edited: int


class GetWorkflowInstanceDataResponse(CradleBaseModel, extra="forbid"):
    items: list[WorkflowInstanceDataRowModel]


class CreateNewStepRequest(CradleBaseModel):
    workflow_instance_id: str


# Workflow Variable Catalogue


class WorkflowVariableCatalogueItemModel(CradleBaseModel, extra="forbid"):
    """Single variable entry in the catalogue"""

    tag: str
    description: Optional[str] = None
    type: str
    namespace: Optional[str] = None
    collection_name: Optional[str] = None
    field_path: Optional[list[str]] = None
    is_computed: bool = False
    is_dynamic: bool = False


class GetWorkflowVariablesResponse(CradleBaseModel, extra="forbid"):
    variables: list[WorkflowVariableCatalogueItemModel]


class WorkflowVariableDetailModel(WorkflowVariableCatalogueItemModel):
    """Detail response for a single variable"""

    examples: Optional[list[str]] = None


class VariableLogicModel(CradleBaseModel, extra="forbid"):
    """
    Minimal variable logic parsed from a rule (single comparison).
    Frontend can display e.g. "if patient.age >= 18" during workflow instance.
    """

    variable_tag: str
    operator: str  # e.g. ">", ">=", "<", "<=", "==", "!="
    value: Any  # literal (int, float, str, bool, etc.)


class ResolveWorkflowVariablesRequest(CradleBaseModel, extra="forbid"):
    """Evaluate a JsonLogic rule in a patient (and optional workflow) context."""

    rule: str
    patient_id: str
    workflow_instance_id: Optional[str] = None
    include_current_user: bool = True


class WorkflowVariableResolutionApiModel(CradleBaseModel, extra="forbid"):
    var: str
    value: Optional[Any] = None
    status: str


class ResolveWorkflowVariablesResponse(CradleBaseModel, extra="forbid"):
    evaluation_status: str
    variable_resolutions: list[WorkflowVariableResolutionApiModel]


# --- Description-variable resolution (markdown `{{...}}` tokens) ---
# SKELETON: request/response shape for resolving the variables referenced by a
# step description, reusing the rule engine's variable catalogue. See
# service/workflow/datasourcing/description_variables.py for the resolver this
# is meant to sit in front of.


class GetDescriptionVariablesRequest(CradleBaseModel, extra="forbid"):
    """
    Which variable tags a step description referenced, extracted client-side
    from its ``{{...}}`` tokens (offsets like ``+3d`` already stripped -- only
    the bare variable name, e.g. ``patient.age`` or ``pregnancies[latest].start_date``).

    TODO: decide whether extraction should instead happen server-side from the
    raw description text, to avoid keeping two token parsers in sync (see the
    TODO on extract_variable_tags in description_variables.py).
    """

    variable_tags: list[str]


class DescriptionVariableResolutionModel(CradleBaseModel, extra="forbid"):
    var: str
    value: Optional[Any] = None
    status: str  # VariableOutcomeStatus value, e.g. "RESOLVED" | "NOT_IMPLEMENTED"


class GetDescriptionVariablesResponse(CradleBaseModel, extra="forbid"):
    resolutions: list[DescriptionVariableResolutionModel]
