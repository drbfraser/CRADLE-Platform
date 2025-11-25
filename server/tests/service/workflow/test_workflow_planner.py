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
)
from service.workflow.workflow_planner import (
    InvalidWorkflowActionError,
    RuleStatus,
    WorkflowPlanner,
)
from validation.workflow_models import (
    CompleteStepActionModel,
    StartStepActionModel,
    StartWorkflowActionModel,
    WorkflowBranchEvaluation,
    WorkflowStepEvaluation,
)

EXPECTED_AVAILABLE_ACTIONS_FOR_SEQUENTIAL_WORKFLOW = [
    StartWorkflowActionModel(),
    CompleteStepActionModel(step_id="si-1"),
    StartStepActionModel(step_id="si-2"),
    CompleteStepActionModel(step_id="si-2"),
]

EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW = [
    # For StartWorkflowActionModel()
    UpdateWorkflowStatusOp(WorkflowStatusEnum.ACTIVE),
    UpdateCurrentStepOp("si-1"),
    UpdateStepStatusOp("si-1", WorkflowStepStatusEnum.ACTIVE),
    UpdateWorkflowStartDate(),
    UpdateWorkflowStepStartDate("si-1"),
    # For CompleteStepActionModel(step_id="si-1")
    UpdateStepStatusOp("si-1", WorkflowStepStatusEnum.COMPLETED),
    UpdateWorkflowStepCompletionDate("si-1"),
    # For StartStepActionModel(step_id="si-2")
    UpdateCurrentStepOp("si-2"),
    UpdateStepStatusOp("si-2", WorkflowStepStatusEnum.ACTIVE),
    UpdateWorkflowStepStartDate("si-2"),
    # For CompleteStepActionModel(step_id="si-2")
    UpdateStepStatusOp("si-2", WorkflowStepStatusEnum.COMPLETED),
    UpdateWorkflowStepCompletionDate("si-2"),
    UpdateCurrentStepOp(None),
    UpdateWorkflowStatusOp(WorkflowStatusEnum.COMPLETED),
    UpdateWorkflowCompletionDate(),
]


def test_sequential_workflow_happy_path(sequential_workflow_view):
    workflow_view = sequential_workflow_view

    action_ops_pairs = [
        (
            EXPECTED_AVAILABLE_ACTIONS_FOR_SEQUENTIAL_WORKFLOW[0],
            EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[0:5],
        ),
        (
            EXPECTED_AVAILABLE_ACTIONS_FOR_SEQUENTIAL_WORKFLOW[1],
            EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[5:7],
        ),
        (
            EXPECTED_AVAILABLE_ACTIONS_FOR_SEQUENTIAL_WORKFLOW[2],
            EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[7:10],
        ),
        (
            EXPECTED_AVAILABLE_ACTIONS_FOR_SEQUENTIAL_WORKFLOW[3],
            EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[10:],
        ),
    ]

    for expected_action, expected_ops in action_ops_pairs:
        actions = WorkflowPlanner.get_available_actions(ctx=workflow_view)
        assert actions == [expected_action]

        ops = WorkflowPlanner.get_operations(ctx=workflow_view, action=actions[0])
        assert ops == expected_ops

        for op in ops:
            op.apply(workflow_view)

    assert WorkflowPlanner.get_available_actions(ctx=workflow_view) == []


def test_invalid_action_throws_error(sequential_workflow_view):
    with pytest.raises(InvalidWorkflowActionError) as e:
        WorkflowPlanner.get_operations(
            ctx=sequential_workflow_view, action=CompleteStepActionModel(step_id="si-1")
        )

    assert e.value.action == CompleteStepActionModel(step_id="si-1")
    assert e.value.available_actions == [StartWorkflowActionModel()]


def test_get_operations_is_stateless(sequential_workflow_view):
    ops = WorkflowPlanner.get_operations(
        ctx=sequential_workflow_view,
        action=StartWorkflowActionModel(),
    )
    assert ops == EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[0:5]

    # Ops haven't been applied, next `get_operations` will produce the same ops
    ops = WorkflowPlanner.get_operations(
        ctx=sequential_workflow_view,
        action=StartWorkflowActionModel(),
    )
    assert ops == EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[0:5]


def test_evaluate_step(sequential_workflow_view):
    view = sequential_workflow_view

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
