from __future__ import annotations

from typing import TYPE_CHECKING

import data.db_operations as crud
from common.commonUtil import get_current_time
from common.workflow_utils import find_pregnancy_id_to_pin
from enums import WorkflowStatusEnum
from models import (
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepOrm,
)

if TYPE_CHECKING:
    from validation.workflow_api_models import (
        SyncWorkflowInstanceRequest,
        SyncWorkflowStepRequest,
        WorkflowSyncProgress,
    )

TERMINAL_STATUSES = {WorkflowStatusEnum.COMPLETED, WorkflowStatusEnum.CANCELLED}
STEP_OWNERSHIP_ERROR = "Workflow step does not belong to this workflow instance."


def save_workflow_sync(upload: SyncWorkflowInstanceRequest, patient_id: str) -> None:
    session = crud.db_session
    instance = session.get(WorkflowInstanceOrm, upload.id, with_for_update=True)
    sync_time = get_current_time()

    if instance is None:
        instance = _create_instance(upload, patient_id)
        steps = {step.id: step for step in instance.steps}
    else:
        if instance.patient_id != patient_id:
            raise ValueError("Patient ID cannot be changed.")
        if upload.workflow_template_id not in (None, instance.workflow_template_id):
            raise ValueError("Workflow template cannot be changed.")
        steps = {
            step.id: step
            for step in WorkflowInstanceStepOrm.query.filter_by(
                workflow_instance_id=instance.id
            ).with_for_update()
        }

    for uploaded_step in upload.steps:
        step = steps.get(uploaded_step.id)
        if step is None or uploaded_step.workflow_instance_id != instance.id:
            raise ValueError(STEP_OWNERSHIP_ERROR)
        if uploaded_step.workflow_template_step_id not in (
            None,
            step.workflow_template_step_id,
        ):
            raise ValueError("Workflow step template cannot be changed.")
        if uploaded_step.form is not None or uploaded_step.form_id not in (
            None,
            step.form_id,
        ):
            raise ValueError("Workflow sync cannot change forms.")
        _apply_progress(step, uploaded_step, sync_time)

    if upload.current_step_id is not None:
        current_step = steps.get(upload.current_step_id)
        if current_step is None:
            raise ValueError(STEP_OWNERSHIP_ERROR)
        if instance.current_step_id != current_step.id:
            if instance.status in TERMINAL_STATUSES or (
                upload.status == WorkflowStatusEnum.ACTIVE
                and current_step.status != WorkflowStatusEnum.ACTIVE
            ):
                raise ValueError("Invalid current step for this workflow.")
            instance.current_step_id = current_step.id

    _apply_progress(instance, upload, sync_time)
    session.add(instance)
    session.commit()


def _create_instance(
    upload: SyncWorkflowInstanceRequest, patient_id: str
) -> WorkflowInstanceOrm:
    if (
        upload.workflow_template_id is not None
        and crud.read(WorkflowTemplateOrm, id=upload.workflow_template_id) is None
    ):
        raise ValueError("Workflow template not found.")
    if len({step.id for step in upload.steps}) != len(upload.steps):
        raise ValueError("Duplicate workflow step IDs.")

    pregnancy_id = (
        find_pregnancy_id_to_pin(patient_id, as_of=upload.start_date)
        if upload.start_date is not None
        else None
    )
    return WorkflowInstanceOrm(
        id=upload.id,
        patient_id=patient_id,
        workflow_template_id=upload.workflow_template_id,
        name=upload.name,
        description=upload.description,
        pregnancy_id=pregnancy_id,
        status=WorkflowStatusEnum.PENDING,
        steps=[
            _create_step(step, upload.workflow_template_id) for step in upload.steps
        ],
    )


def _create_step(
    upload: SyncWorkflowStepRequest, template_id: str | None
) -> WorkflowInstanceStepOrm:
    if crud.read(WorkflowInstanceStepOrm, id=upload.id) is not None:
        raise ValueError(STEP_OWNERSHIP_ERROR)
    if upload.workflow_template_step_id is not None:
        template_step = crud.read(
            WorkflowTemplateStepOrm, id=upload.workflow_template_step_id
        )
        if template_step is None or template_step.workflow_template_id != template_id:
            raise ValueError("Workflow step template does not belong to this template.")

    return WorkflowInstanceStepOrm(
        id=upload.id,
        workflow_template_step_id=upload.workflow_template_step_id,
        name=upload.name,
        description=upload.description,
        status=WorkflowStatusEnum.PENDING,
    )


def _apply_progress(
    record: WorkflowInstanceOrm | WorkflowInstanceStepOrm,
    upload: WorkflowSyncProgress,
    sync_time: int,
) -> None:
    if record.status != upload.status and (
        record.status in TERMINAL_STATUSES
        or upload.status in (WorkflowStatusEnum.PENDING, WorkflowStatusEnum.CANCELLED)
    ):
        raise ValueError(
            "Workflow progress cannot move backward or be cancelled in sync."
        )

    if record.start_date is None:
        record.start_date = upload.start_date
    if record.completion_date is None:
        record.completion_date = upload.completion_date
    if record.start_date is not None:
        if record.start_date > sync_time:
            raise ValueError("last_edited cannot be before start_date")
        if (
            record.completion_date is not None
            and record.completion_date < record.start_date
        ):
            raise ValueError("completion_date cannot be before start_date")

    record.status = upload.status
    record.last_edited = sync_time
