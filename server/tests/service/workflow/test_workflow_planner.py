from typing import Optional
from unittest.mock import patch

import pytest

from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from service.workflow.workflow_planner import (
    InvalidWorkflowActionError,
    RuleStatus,
    WorkflowPlanner,
)
from validation.workflow_models import (
    CompleteStepActionModel,
    CompleteWorkflowActionModel,
    StartStepActionModel,
    StartWorkflowActionModel,
    WorkflowBranchEvaluation,
    WorkflowInstanceModel,
    WorkflowStepEvaluation,
)


def check_workflow_instance_state(
    workflow_instance: WorkflowInstanceModel,
    status: WorkflowStatusEnum,
    current_step_id: Optional[str],
    step_status: dict[str, WorkflowStepStatusEnum],
):
    assert workflow_instance.status == status

    assert workflow_instance.current_step_id == current_step_id

    for step in workflow_instance.steps:
        assert step.id in step_status
        assert step.status == step_status[step.id]


def test_progress_linear_workflow_in_order(sequential_workflow_view):
    workflow_view = sequential_workflow_view
    workflow_view.instance.patient_id = "test-patient-123"

    with patch(
        "service.workflow.workflow_planner.RuleEvaluator.evaluate_rule",
        return_value=(RuleStatus.TRUE, []),
    ):
        check_workflow_instance_state(
            workflow_view.instance,
            status="Pending",
            current_step_id=None,
            step_status={"si-1": "Pending", "si-2": "Pending"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [StartWorkflowActionModel()]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id=None,
            step_status={"si-1": "Pending", "si-2": "Pending"},
        )

        WorkflowPlanner.advance(workflow_view)
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-1",
            step_status={"si-1": "Pending", "si-2": "Pending"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [StartStepActionModel(step_id="si-1")]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-1",
            step_status={"si-1": "Active", "si-2": "Pending"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [CompleteStepActionModel(step_id="si-1")]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-1",
            step_status={"si-1": "Completed", "si-2": "Pending"},
        )

        WorkflowPlanner.advance(workflow_view)
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-2",
            step_status={"si-1": "Completed", "si-2": "Pending"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [StartStepActionModel(step_id="si-2")]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-2",
            step_status={"si-1": "Completed", "si-2": "Active"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [CompleteStepActionModel(step_id="si-2")]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-2",
            step_status={"si-1": "Completed", "si-2": "Completed"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [CompleteWorkflowActionModel()]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Completed",
            current_step_id="si-2",
            step_status={"si-1": "Completed", "si-2": "Completed"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == []


def test_progress_linear_workflow_out_of_order(sequential_workflow_view):
    workflow_view = sequential_workflow_view
    workflow_view.instance.patient_id = "test-patient-123"

    with patch(
        "service.workflow.workflow_planner.RuleEvaluator.evaluate_rule",
        return_value=(RuleStatus.TRUE, []),
    ):
        check_workflow_instance_state(
            workflow_view.instance,
            status="Pending",
            current_step_id=None,
            step_status={"si-1": "Pending", "si-2": "Pending"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [StartWorkflowActionModel()]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id=None,
            step_status={"si-1": "Pending", "si-2": "Pending"},
        )

        # Instead of advancing to si-1, go to si-2
        WorkflowPlanner.override_current_step(workflow_view, "si-2")
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-2",
            step_status={"si-1": "Pending", "si-2": "Pending"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [StartStepActionModel(step_id="si-2")]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-2",
            step_status={"si-1": "Pending", "si-2": "Active"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [CompleteStepActionModel(step_id="si-2")]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-2",
            step_status={"si-1": "Pending", "si-2": "Completed"},
        )

        # Go back to si-1 and start and complete it
        WorkflowPlanner.override_current_step(workflow_view, "si-1")
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-1",
            step_status={"si-1": "Pending", "si-2": "Completed"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [StartStepActionModel(step_id="si-1")]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-1",
            step_status={"si-1": "Active", "si-2": "Completed"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [CompleteStepActionModel(step_id="si-1")]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-1",
            step_status={"si-1": "Completed", "si-2": "Completed"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == []  # Can't complete workflow yet, not on terminal step

        # Can advance or override to get to si-2 (the terminal step)
        WorkflowPlanner.advance(workflow_view)
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-2",
            step_status={"si-1": "Completed", "si-2": "Completed"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == [CompleteWorkflowActionModel()]

        WorkflowPlanner.apply_action(workflow_view, actions[0])
        check_workflow_instance_state(
            workflow_view.instance,
            status="Completed",
            current_step_id="si-2",
            step_status={"si-1": "Completed", "si-2": "Completed"},
        )

        actions = WorkflowPlanner.get_available_actions(workflow_view)
        assert actions == []


def test_current_step_does_not_advance_if_not_completed(sequential_workflow_view):
    workflow_view = sequential_workflow_view
    workflow_view.instance.patient_id = "test-patient-123"

    with patch(
        "service.workflow.workflow_planner.RuleEvaluator.evaluate_rule",
        return_value=(RuleStatus.TRUE, []),
    ):
        # Start the workflow
        actions = WorkflowPlanner.get_available_actions(workflow_view)
        WorkflowPlanner.apply_action(workflow_view, actions[0])
        WorkflowPlanner.advance(workflow_view)

        # Start the first step (si-1)
        actions = WorkflowPlanner.get_available_actions(workflow_view)
        WorkflowPlanner.apply_action(workflow_view, actions[0])

        # Current step should still be si-1
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-1",
            step_status={"si-1": "Active", "si-2": "Pending"},
        )

        # Advancing now should not change current step yet
        WorkflowPlanner.advance(workflow_view)
        check_workflow_instance_state(
            workflow_view.instance,
            status="Active",
            current_step_id="si-1",
            step_status={"si-1": "Active", "si-2": "Pending"},
        )


def test_apply_invalid_action_throws_error(sequential_workflow_view):
    with pytest.raises(InvalidWorkflowActionError) as e:
        WorkflowPlanner.apply_action(
            ctx=sequential_workflow_view, action=CompleteStepActionModel(step_id="si-1")
        )

    assert e.value.action == CompleteStepActionModel(step_id="si-1")
    assert e.value.available_actions == [StartWorkflowActionModel()]


def test_evaluate_step(sequential_workflow_view):
    view = sequential_workflow_view
    view.instance.patient_id = "test-patient-123"

    with patch(
        "service.workflow.workflow_planner.RuleEvaluator.evaluate_rule",
        return_value=(RuleStatus.TRUE, []),
    ):
        expected_step_1_evaluation = WorkflowStepEvaluation(
            branch_evaluations=[
                WorkflowBranchEvaluation(
                    branch_id="b-1",
                    rule=None,
                    rule_status=RuleStatus.TRUE,
                    var_resolutions=[],
                ),
            ],
            selected_branch_id="b-1",
        )
        expected_step_2_evaluation = WorkflowStepEvaluation(
            branch_evaluations=[], selected_branch_id=None
        )
        actual_step_1_evaluation = WorkflowPlanner.evaluate_step(
            view, view.get_instance_step("si-1")
        )
        actual_step_2_evaluation = WorkflowPlanner.evaluate_step(
            view, view.get_instance_step("si-2")
        )

        assert expected_step_1_evaluation == actual_step_1_evaluation
        assert expected_step_2_evaluation == actual_step_2_evaluation
