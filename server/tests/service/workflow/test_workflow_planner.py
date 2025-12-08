from dataclasses import dataclass
from typing import TypeAlias, Union

import pytest

from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from service.workflow.workflow_operations import (
    UpdateCurrentStepOp,
    UpdateStepStatusOp,
    UpdateWorkflowCompletionDate,
    UpdateWorkflowStartDate,
    UpdateWorkflowStatusOp,
    UpdateWorkflowStepCompletionDate,
    UpdateWorkflowStepStartDate,
    WorkflowOp,
)
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
    WorkflowActionModel,
    WorkflowBranchEvaluation,
    WorkflowStepEvaluation,
)


@dataclass
class DoAdvance:
    expected_ops: list[WorkflowOp]


@dataclass
class DoOverride:
    step_id: str
    expected_ops: list[WorkflowOp]


@dataclass
class GetActions:
    expected_actions: WorkflowActionModel


@dataclass
class GetOps:
    action: WorkflowActionModel
    expected_ops: list[WorkflowOp]


@dataclass
class ApplyAction:
    action: WorkflowActionModel
    expected_ops: list[WorkflowOp]


TestStep: TypeAlias = Union[DoAdvance, DoOverride, ApplyAction]


def run_test_step(workflow_view, test_step: TestStep):
    def assert_ops(ops, expected_ops):
        assert ops == expected_ops, f"Assert failed at test step {test_step}"

    def assert_and_apply_ops(ops, expected_ops):
        assert_ops(ops, expected_ops)
        for op in ops:
            op.apply(workflow_view)

    def assert_actions(expected_actions):
        actions = WorkflowPlanner.get_available_actions(ctx=workflow_view)
        assert actions == expected_actions, f"Assert failed at test step {test_step}"

    if isinstance(test_step, DoAdvance):
        ops = WorkflowPlanner.advance(workflow_view)
        assert_and_apply_ops(ops, test_step.expected_ops)

    elif isinstance(test_step, DoOverride):
        ops = WorkflowPlanner.override_current_step(workflow_view, test_step.step_id)
        assert_and_apply_ops(ops, test_step.expected_ops)

    elif isinstance(test_step, GetActions):
        assert_actions(test_step.expected_actions)

    elif isinstance(test_step, GetOps):
        ops = WorkflowPlanner.get_operations(workflow_view, test_step.action)
        assert_ops(ops, test_step.expected_ops)

    elif isinstance(test_step, ApplyAction):
        ops = WorkflowPlanner.get_operations(workflow_view, test_step.action)
        assert_and_apply_ops(ops, test_step.expected_ops)


def run_test_sequence(workflow_view, sequence: list[TestStep]):
    for test_step in sequence:
        run_test_step(workflow_view, test_step)


def test_sequential_workflow__in_order(sequential_workflow_view, mocker):
    workflow_view = sequential_workflow_view
    
    workflow_view.instance.patient_id = "test-patient-123"
    
    mocker.patch(
        'service.workflow.workflow_planner.IntegratedRuleEvaluator.evaluate_rule',
        return_value=(RuleStatus.TRUE, [])
    )

    sequence = [
        DoAdvance(expected_ops=[]),
        GetActions(expected_actions=[StartWorkflowActionModel()]),
        ApplyAction(
            action=StartWorkflowActionModel(),
            expected_ops=[
                UpdateWorkflowStatusOp(WorkflowStatusEnum.ACTIVE),
                UpdateWorkflowStartDate(),
            ],
        ),
        DoAdvance(expected_ops=[UpdateCurrentStepOp("si-1")]),
        GetActions(expected_actions=[StartStepActionModel(step_id="si-1")]),
        ApplyAction(
            action=StartStepActionModel(step_id="si-1"),
            expected_ops=[
                UpdateStepStatusOp("si-1", WorkflowStepStatusEnum.ACTIVE),
                UpdateWorkflowStepStartDate("si-1"),
            ],
        ),
        DoAdvance(expected_ops=[]),  # Should do nothing, current step isn't COMPLETED
        GetActions(expected_actions=[CompleteStepActionModel(step_id="si-1")]),
        ApplyAction(
            action=CompleteStepActionModel(step_id="si-1"),
            expected_ops=[
                UpdateStepStatusOp("si-1", WorkflowStepStatusEnum.COMPLETED),
                UpdateWorkflowStepCompletionDate("si-1"),
            ],
        ),
        DoAdvance(expected_ops=[UpdateCurrentStepOp("si-2")]),
        GetActions(expected_actions=[StartStepActionModel(step_id="si-2")]),
        ApplyAction(
            action=StartStepActionModel(step_id="si-2"),
            expected_ops=[
                UpdateStepStatusOp("si-2", WorkflowStepStatusEnum.ACTIVE),
                UpdateWorkflowStepStartDate("si-2"),
            ],
        ),
        GetActions(expected_actions=[CompleteStepActionModel(step_id="si-2")]),
        ApplyAction(
            action=CompleteStepActionModel(step_id="si-2"),
            expected_ops=[
                UpdateStepStatusOp("si-2", WorkflowStepStatusEnum.COMPLETED),
                UpdateWorkflowStepCompletionDate("si-2"),
            ],
        ),
        GetActions(expected_actions=[CompleteWorkflowActionModel()]),
        ApplyAction(
            action=CompleteWorkflowActionModel(),
            expected_ops=[
                UpdateWorkflowStatusOp(WorkflowStatusEnum.COMPLETED),
                UpdateWorkflowCompletionDate(),
            ],
        ),
        # No steps left! current_step_id left at "si-2"
        DoAdvance(expected_ops=[]),
    ]

    run_test_sequence(workflow_view, sequence)


def test_sequential_workflow__out_of_order(sequential_workflow_view, mocker):
    workflow_view = sequential_workflow_view
    
    workflow_view.instance.patient_id = "test-patient-123"
    
    mocker.patch(
        'service.workflow.workflow_planner.IntegratedRuleEvaluator.evaluate_rule',
        return_value=(RuleStatus.TRUE, [])
    )

    sequence = [
        DoAdvance(expected_ops=[]),
        GetActions(expected_actions=[StartWorkflowActionModel()]),
        ApplyAction(
            action=StartWorkflowActionModel(),
            expected_ops=[
                UpdateWorkflowStatusOp(WorkflowStatusEnum.ACTIVE),
                UpdateWorkflowStartDate(),
            ],
        ),
        # Instead of advancing to si-1, go to si-2. NOTE: si-1 has status PENDING
        # and has not already started.
        DoOverride(step_id="si-2", expected_ops=[UpdateCurrentStepOp("si-2")]),
        DoAdvance(expected_ops=[]),  # Should do nothing, current step isn't COMPLETED
        GetActions(expected_actions=[StartStepActionModel(step_id="si-2")]),
        ApplyAction(
            action=StartStepActionModel(step_id="si-2"),
            expected_ops=[
                UpdateStepStatusOp("si-2", WorkflowStepStatusEnum.ACTIVE),
                UpdateWorkflowStepStartDate("si-2"),
            ],
        ),
        GetActions(expected_actions=[CompleteStepActionModel(step_id="si-2")]),
        ApplyAction(
            action=CompleteStepActionModel(step_id="si-2"),
            expected_ops=[
                UpdateStepStatusOp("si-2", WorkflowStepStatusEnum.COMPLETED),
                UpdateWorkflowStepCompletionDate("si-2"),
            ],
        ),
        DoAdvance(expected_ops=[]),  # Should do nothing, current step is terminal
        # Go back to si-1 and start and complete it
        DoOverride(step_id="si-1", expected_ops=[UpdateCurrentStepOp("si-1")]),
        DoAdvance(expected_ops=[]),  # Should do nothing, current step isn't COMPLETED
        GetActions(expected_actions=[StartStepActionModel(step_id="si-1")]),
        ApplyAction(
            action=StartStepActionModel(step_id="si-1"),
            expected_ops=[
                UpdateStepStatusOp("si-1", WorkflowStepStatusEnum.ACTIVE),
                UpdateWorkflowStepStartDate("si-1"),
            ],
        ),
        DoAdvance(expected_ops=[]),  # Should do nothing, current step isn't COMPLETED
        GetActions(expected_actions=[CompleteStepActionModel(step_id="si-1")]),
        ApplyAction(
            action=CompleteStepActionModel(step_id="si-1"),
            expected_ops=[
                UpdateStepStatusOp("si-1", WorkflowStepStatusEnum.COMPLETED),
                UpdateWorkflowStepCompletionDate("si-1"),
            ],
        ),
        # Can't complete workflow yet, not on terminal step
        GetActions(expected_actions=[]),
        DoAdvance(expected_ops=[UpdateCurrentStepOp("si-2")]),
        GetActions(expected_actions=[CompleteWorkflowActionModel()]),
        ApplyAction(
            action=CompleteWorkflowActionModel(),
            expected_ops=[
                UpdateWorkflowStatusOp(WorkflowStatusEnum.COMPLETED),
                UpdateWorkflowCompletionDate(),
            ],
        ),
        # No steps left! current_step_id left at "si-2"
        DoAdvance(expected_ops=[]),
    ]

    run_test_sequence(workflow_view, sequence)


def test_invalid_action_throws_error(sequential_workflow_view):
    with pytest.raises(InvalidWorkflowActionError) as e:
        WorkflowPlanner.get_operations(
            ctx=sequential_workflow_view, action=CompleteStepActionModel(step_id="si-1")
        )

    assert e.value.action == CompleteStepActionModel(step_id="si-1")
    assert e.value.available_actions == [StartWorkflowActionModel()]


def test_get_operations_is_stateless(sequential_workflow_view):
    workflow_view = sequential_workflow_view

    sequence = [
        DoAdvance(expected_ops=[]),
        GetActions(expected_actions=[StartWorkflowActionModel()]),
        GetOps(
            action=StartWorkflowActionModel(),
            expected_ops=[
                UpdateWorkflowStatusOp(WorkflowStatusEnum.ACTIVE),
                UpdateWorkflowStartDate(),
            ],
        ),
        # Ops haven't been applied, next `get_operations` will produce the same ops
        GetOps(
            action=StartWorkflowActionModel(),
            expected_ops=[
                UpdateWorkflowStatusOp(WorkflowStatusEnum.ACTIVE),
                UpdateWorkflowStartDate(),
            ],
        ),
    ]

    run_test_sequence(workflow_view, sequence)


def test_evaluate_step(sequential_workflow_view, mocker):
    view = sequential_workflow_view
    
    view.instance.patient_id = "test-patient-123"
    
    mocker.patch(
        'service.workflow.workflow_planner.IntegratedRuleEvaluator.evaluate_rule',
        return_value=(RuleStatus.TRUE, [])
    )

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
