import pytest

from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from service.workflow.workflow_planner import (
    WorkflowOp,
    WorkflowOpName,
    WorkflowPlanner,
    WorkflowView,
)
from service.workflow.workflow_service import WorkflowService
from tests import helpers
from validation.workflow_models import WorkflowInstanceModel, WorkflowTemplateModel


@pytest.fixture
def sequential_workflow_template() -> WorkflowTemplateModel:
    step_template_1_id = "st-1"
    step_template_2_id = "st-2"
    workflow_template_id = "wt-1"

    template_step_1 = helpers.make_workflow_template_step(
        id=step_template_1_id,
        workflow_template_id=workflow_template_id,
        branches=[
            helpers.make_workflow_template_branch(
                step_id=step_template_1_id, target_step_id=step_template_2_id
            )
        ],
    )
    template_step_2 = helpers.make_workflow_template_step(
        id=step_template_2_id,
        workflow_template_id=workflow_template_id,
    )
    template_workflow = helpers.make_workflow_template(
        id=workflow_template_id,
        starting_step_id=step_template_1_id,
        steps=[template_step_1, template_step_2],
    )
    return WorkflowTemplateModel(**template_workflow)


@pytest.fixture
def sequential_workflow_instance(sequential_workflow_template) -> WorkflowInstanceModel:
    """Initial workflow instance"""
    workflow_instance = WorkflowService.generate_workflow_instance(
        sequential_workflow_template
    )

    # make IDs a bit more friendly to reference later
    step_instance_1_id = "si-1"
    step_instance_2_id = "si-2"
    workflow_instance.steps[0].id = step_instance_1_id
    workflow_instance.steps[1].id = step_instance_2_id

    return workflow_instance


@pytest.fixture
def sequential_workflow_view(
    sequential_workflow_template, sequential_workflow_instance
) -> WorkflowView:
    return WorkflowView(sequential_workflow_template, sequential_workflow_instance)


def apply_op(op: WorkflowOp, workflow_view: WorkflowView):
    name = op.name
    params = op.params or {}

    if name == WorkflowOpName.START_WORKFLOW:
        workflow_view.instance.status = WorkflowStatusEnum.ACTIVE

    elif name == WorkflowOpName.TRANSITION_TO_STEP:
        from_step_id = params.get("from_step_id")
        to_step_id = params.get("to_step_id")

        assert workflow_view.instance.current_step_id == from_step_id
        workflow_view.instance.current_step_id = to_step_id

    elif name == WorkflowOpName.START_STEP:
        step_id = params["step_id"]
        step = workflow_view.get_instance_step(step_id)
        step.status = WorkflowStepStatusEnum.ACTIVE

    elif name == WorkflowOpName.COMPLETE_STEP:
        step_id = params["step_id"]
        step = workflow_view.get_instance_step(step_id)
        step.status = WorkflowStepStatusEnum.COMPLETED

    elif name == WorkflowOpName.COMPLETE_WORKFLOW:
        workflow_view.instance.status = WorkflowStatusEnum.COMPLETED


def apply_ops(ops: list[WorkflowOpName], workflow_view: WorkflowView):
    for op in ops:
        apply_op(op, workflow_view)


EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW = [
    WorkflowOp(
        name=WorkflowOpName.START_WORKFLOW,
    ),
    WorkflowOp(
        name=WorkflowOpName.TRANSITION_TO_STEP,
        params={
            "from_step_id": None,
            "to_step_id": "si-1",
        },
    ),
    WorkflowOp(name=WorkflowOpName.START_STEP, params={"step_id": "si-1"}),
    WorkflowOp(name=WorkflowOpName.COMPLETE_STEP, params={"step_id": "si-1"}),
    WorkflowOp(
        name=WorkflowOpName.TRANSITION_TO_STEP,
        params={
            "from_step_id": "si-1",
            "to_step_id": "si-2",
        },
    ),
    WorkflowOp(name=WorkflowOpName.START_STEP, params={"step_id": "si-2"}),
    WorkflowOp(name=WorkflowOpName.COMPLETE_STEP, params={"step_id": "si-2"}),
    WorkflowOp(
        name=WorkflowOpName.TRANSITION_TO_STEP,
        params={
            "from_step_id": "si-2",
            "to_step_id": None,
        },
    ),
    WorkflowOp(
        name=WorkflowOpName.COMPLETE_WORKFLOW,
    ),
]


def test_sequential_workflow(sequential_workflow_view):
    planner = WorkflowPlanner()

    plan_calls = [
        (
            WorkflowOp(name=WorkflowOpName.START_WORKFLOW),
            EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[0:3],
        ),
        (
            WorkflowOp(name=WorkflowOpName.COMPLETE_STEP, params={"step_id": "si-1"}),
            EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[3:6],
        ),
        (
            WorkflowOp(name=WorkflowOpName.COMPLETE_STEP, params={"step_id": "si-2"}),
            EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[6:8],
        ),
        (None, [EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[8]]),
    ]

    for op, expected_ops in plan_calls:
        ops = planner.plan(ctx=sequential_workflow_view, operation=op)
        assert ops == expected_ops
        apply_ops(ops, sequential_workflow_view)


def test_invalid_operation_name_throws_error(sequential_workflow_view):
    planner = WorkflowPlanner()

    with pytest.raises(NotImplementedError):
        planner.plan(
            ctx=sequential_workflow_view, operation=WorkflowOp(name="override_step")
        )


def test_complete_step_before_workflow_started_throws_error(sequential_workflow_view):
    planner = WorkflowPlanner()

    with pytest.raises(AssertionError) as e:
        planner.plan(
            ctx=sequential_workflow_view,
            operation=WorkflowOp(
                name=WorkflowOpName.COMPLETE_STEP, params={"step_id": "si-1"}
            ),
        )

    assert "Step ID must be the current step" in str(e)


def test_complete_current_step_after_workflow_completed_throws_error(
    sequential_workflow_view,
):
    planner = WorkflowPlanner()

    plan_calls = [
        WorkflowOp(name=WorkflowOpName.START_WORKFLOW),
        WorkflowOp(name=WorkflowOpName.COMPLETE_STEP, params={"step_id": "si-1"}),
        WorkflowOp(name=WorkflowOpName.COMPLETE_STEP, params={"step_id": "si-2"}),
        None,
    ]

    for op in plan_calls:
        ops = planner.plan(ctx=sequential_workflow_view, operation=op)
        apply_ops(ops, sequential_workflow_view)

    with pytest.raises(AssertionError) as e:
        planner.plan(
            ctx=sequential_workflow_view,
            operation=WorkflowOp(
                name=WorkflowOpName.COMPLETE_STEP, params={"step_id": "si-1"}
            ),
        )

    assert "Step ID must be the current step" in str(e)


def test_plan_workflow_without_applying_ops(sequential_workflow_view):
    planner = WorkflowPlanner()

    ops = planner.plan(
        ctx=sequential_workflow_view,
        operation=WorkflowOp(name=WorkflowOpName.START_WORKFLOW),
    )
    assert ops == EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[0:3]

    # Ops haven't been applied, next plan will produce the same ops
    # Shows the runner is stateless
    ops = planner.plan(
        ctx=sequential_workflow_view,
        operation=WorkflowOp(name=WorkflowOpName.START_WORKFLOW),
    )
    assert ops == EXPECTED_OPS_FOR_SEQUENTIAL_WORKFLOW[0:3]
