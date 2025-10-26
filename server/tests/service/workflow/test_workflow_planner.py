import pytest

from service.workflow.workflow_actions import (
    StartWorkflowAction,
    StartStepAction,
    CompleteStepAction,
)
from service.workflow.workflow_operations import (
    StartWorkflowOp,
    CompleteWorkflowOp,
    StartStepOp,
    CompleteStepOp,
    TransitionStepOp,
)
from service.workflow.workflow_planner import WorkflowPlanner, InvalidWorkflowActionError


EXPECTED_AVAILABLE_ACTIONS_FOR_SEQUENTIAL_WORKFLOW = [
    StartWorkflowAction(),
    CompleteStepAction(step_id="si-1"),
    StartStepAction(step_id="si-2"),
    CompleteStepAction(step_id="si-2"),
]

EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW = [
    StartWorkflowOp(),
    TransitionStepOp(to_step_id="si-1"),
    StartStepOp(step_id="si-1"),
    CompleteStepOp(step_id="si-1"),
    TransitionStepOp(to_step_id="si-2"),
    StartStepOp(step_id="si-2"),
    CompleteStepOp(step_id="si-2"),
    TransitionStepOp(to_step_id=None),
    CompleteWorkflowOp(),
]


def test_sequential_workflow_happy_path(sequential_workflow_view):
    workflow_view = sequential_workflow_view

    action_ops_pairs = [
        (
            EXPECTED_AVAILABLE_ACTIONS_FOR_SEQUENTIAL_WORKFLOW[0],
            EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[0:3],
        ),
        (
            EXPECTED_AVAILABLE_ACTIONS_FOR_SEQUENTIAL_WORKFLOW[1],
            [EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[3]],
        ),
        (
            EXPECTED_AVAILABLE_ACTIONS_FOR_SEQUENTIAL_WORKFLOW[2],
            EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[4:6],
        ),
        (
            EXPECTED_AVAILABLE_ACTIONS_FOR_SEQUENTIAL_WORKFLOW[3],
            EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[6:9],
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
            ctx=sequential_workflow_view,
            action=CompleteStepAction(step_id="si-1")
        )

    assert e.value.action == CompleteStepAction(step_id="si-1")
    assert e.value.available_actions == [StartWorkflowAction()]


def test_get_operations_is_stateless(sequential_workflow_view):
    ops = WorkflowPlanner.get_operations(
        ctx=sequential_workflow_view,
        action=StartWorkflowAction(),
    )
    assert ops == EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[0:3]

    # Ops haven't been applied, next `get_operations` will produce the same ops
    ops = WorkflowPlanner.get_operations(
        ctx=sequential_workflow_view,
        action=StartWorkflowAction(),
    )
    assert ops == EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[0:3]
