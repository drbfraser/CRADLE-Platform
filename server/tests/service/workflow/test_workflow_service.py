import pytest

from service.workflow.workflow_service import WorkflowService
from tests.helpers import get_uuid, make_workflow_template, make_workflow_template_step
from validation.workflow_models import WorkflowTemplateModel
from service.workflow.workflow_actions import (
    StartWorkflowAction,
    StartStepAction,
    CompleteStepAction,
)
from service.workflow.workflow_errors import InvalidWorkflowActionError


def test_workflow_service__generate_workflow_instance():
    workflow_template_id = get_uuid()
    step_template_1_id = get_uuid()
    step_template_2_id = get_uuid()

    step_templates = [
        make_workflow_template_step(
            id=step_template_1_id,
            name="Step 1",
            workflow_template_id=workflow_template_id,
        ),
        make_workflow_template_step(
            id=step_template_2_id,
            name="Step 2",
            workflow_template_id=workflow_template_id,
        ),
    ]

    workflow_template_dict = make_workflow_template(
        id=workflow_template_id, steps=step_templates
    )

    workflow_template = WorkflowTemplateModel(**workflow_template_dict)

    workflow_instance = WorkflowService.generate_workflow_instance(workflow_template)

    assert workflow_instance.id is not None
    assert workflow_instance.name == workflow_template_dict["name"]
    assert workflow_instance.description == workflow_template_dict["description"]
    assert workflow_instance.status == "Pending"
    assert workflow_instance.workflow_template_id == workflow_template_dict["id"]
    assert workflow_instance.start_date is None
    assert workflow_instance.current_step_id is None
    assert workflow_instance.last_edited is None
    assert workflow_instance.completion_date is None
    assert workflow_instance.patient_id is None

    assert len(workflow_instance.steps) == 2

    actual_step_names = {step.name for step in workflow_instance.steps}
    expected_step_names = {"Step 1", "Step 2"}
    assert actual_step_names == expected_step_names

    for step_instance in workflow_instance.steps:
        if step_instance.name == "Step 1":
            assert step_instance.workflow_template_step_id == step_template_1_id
        else:
            assert step_instance.workflow_template_step_id == step_template_2_id

        assert step_instance.id is not None
        assert step_instance.workflow_instance_id == workflow_instance.id
        assert step_instance.description is not None  # Leniant check for convenience
        assert step_instance.status == "Pending"
        assert step_instance.start_date is None
        assert step_instance.last_edited is None
        assert step_instance.completion_date is None
        assert step_instance.expected_completion is None
        assert step_instance.data is None
        assert step_instance.triggered_by is None
        assert step_instance.form_id is None
        assert step_instance.form is None


def test_workflow_service__sequential_workflow_happy_path(sequential_workflow_view):
    workflow_view = sequential_workflow_view

    assert workflow_view.instance.status == "Pending"
    assert workflow_view.instance.current_step_id is None
    assert workflow_view.get_instance_step("si-1").status == "Pending"
    assert workflow_view.get_instance_step("si-2").status == "Pending"

    actions = WorkflowService.get_available_workflow_actions(
        workflow_instance=workflow_view.instance,
        workflow_template=workflow_view.template,
    )

    assert actions == [StartWorkflowAction()]

    WorkflowService.apply_workflow_action(
        action=StartWorkflowAction(),
        workflow_instance=workflow_view.instance,
        workflow_template=workflow_view.template,
    )

    assert workflow_view.instance.status == "Active"
    assert workflow_view.instance.current_step_id == "si-1"
    assert workflow_view.get_instance_step("si-1").status == "Active"
    assert workflow_view.get_instance_step("si-2").status == "Pending"

    actions = WorkflowService.get_available_workflow_actions(
        workflow_instance=workflow_view.instance,
        workflow_template=workflow_view.template,
    )

    assert actions == [CompleteStepAction(step_id='si-1')]

    WorkflowService.apply_workflow_action(
        action=CompleteStepAction(step_id='si-1'),
        workflow_instance=workflow_view.instance,
        workflow_template=workflow_view.template,
    )

    assert workflow_view.instance.status == "Active"
    assert workflow_view.instance.current_step_id == "si-1"
    assert workflow_view.get_instance_step("si-1").status == "Completed"
    assert workflow_view.get_instance_step("si-2").status == "Pending"

    actions = WorkflowService.get_available_workflow_actions(
        workflow_instance=workflow_view.instance,
        workflow_template=workflow_view.template,
    )

    assert actions == [StartStepAction(step_id='si-2')]

    WorkflowService.apply_workflow_action(
        action=StartStepAction(step_id='si-2'),
        workflow_instance=workflow_view.instance,
        workflow_template=workflow_view.template,
    )

    assert workflow_view.instance.status == "Active"
    assert workflow_view.instance.current_step_id == "si-2"
    assert workflow_view.get_instance_step("si-1").status == "Completed"
    assert workflow_view.get_instance_step("si-2").status == "Active"

    actions = WorkflowService.get_available_workflow_actions(
        workflow_instance=workflow_view.instance,
        workflow_template=workflow_view.template,
    )

    assert actions == [CompleteStepAction(step_id='si-2')]

    WorkflowService.apply_workflow_action(
        action=CompleteStepAction(step_id='si-2'),
        workflow_instance=workflow_view.instance,
        workflow_template=workflow_view.template,
    )

    assert workflow_view.instance.status == "Completed"
    assert workflow_view.instance.current_step_id is None
    assert workflow_view.get_instance_step("si-1").status == "Completed"
    assert workflow_view.get_instance_step("si-2").status == "Completed"

    actions = WorkflowService.get_available_workflow_actions(
        workflow_instance=workflow_view.instance,
        workflow_template=workflow_view.template,
    )

    assert actions == []


def test_workflow_service__apply_invalid_workflow_action(sequential_workflow_view):
    workflow_view = sequential_workflow_view

    with pytest.raises(InvalidWorkflowActionError) as e:
        WorkflowService.apply_workflow_action(
            action=CompleteStepAction(step_id="si-1"),
            workflow_instance=workflow_view.instance,
            workflow_template=workflow_view.template,
        )

    assert e.value.action == CompleteStepAction(step_id="si-1")
    assert e.value.available_actions == [StartWorkflowAction()]
