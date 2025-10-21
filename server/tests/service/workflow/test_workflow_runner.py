import pytest

from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from service.workflow.workflow_runner import (
    WorkflowEventType,
    WorkflowRunner,
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


@pytest.fixture
def runner() -> WorkflowRunner:
    return WorkflowRunner(
        record_timestamps=False,  # Easier to validate events without timestamps
    )


def apply_event(event: dict, workflow_view: WorkflowView):
    event_type = event["type"]

    if (
        event_type == WorkflowEventType.WORKFLOW_STARTED
        or event_type == WorkflowEventType.WORKFLOW_COMPLETED
    ):
        workflow_view.instance.status = event["new_status"]
    elif (
        event_type == WorkflowEventType.STEP_STARTED
        or event_type == WorkflowEventType.STEP_COMPLETED
    ):
        workflow_view.get_instance_step(event["step_id"]).status = event["new_status"]
    elif event_type == WorkflowEventType.STEP_TRANSITION:
        workflow_view.instance.current_step_id = event["to_step"]


def apply_events(events: list[dict], workflow_view: WorkflowView):
    for event in events:
        apply_event(event, workflow_view)


EXPECTED_EVENTS_FOR_COMPLETED_SEQUENTIAL_WORKFLOW = [
    {
        "type": "workflow_started",
        "old_status": WorkflowStatusEnum.PENDING,
        "new_status": WorkflowStatusEnum.ACTIVE,
        "timestamp": None,
    },
    {
        "type": "step_transition",
        "from_step": None,
        "to_step": "si-1",
        "timestamp": None,
    },
    {
        "type": "step_started",
        "step_id": "si-1",
        "old_status": WorkflowStepStatusEnum.PENDING,
        "new_status": WorkflowStepStatusEnum.ACTIVE,
        "timestamp": None,
    },
    {
        "type": "step_completed",
        "step_id": "si-1",
        "old_status": WorkflowStepStatusEnum.ACTIVE,
        "new_status": WorkflowStepStatusEnum.COMPLETED,
        "timestamp": None,
    },
    {
        "type": "step_transition",
        "from_step": "si-1",
        "to_step": "si-2",
        "timestamp": None,
    },
    {
        "type": "step_started",
        "step_id": "si-2",
        "old_status": WorkflowStepStatusEnum.PENDING,
        "new_status": WorkflowStepStatusEnum.ACTIVE,
        "timestamp": None,
    },
    {
        "type": "step_completed",
        "step_id": "si-2",
        "old_status": WorkflowStepStatusEnum.ACTIVE,
        "new_status": WorkflowStepStatusEnum.COMPLETED,
        "timestamp": None,
    },
    {
        "type": "step_transition",
        "from_step": "si-2",
        "to_step": None,
        "timestamp": None,
    },
    {
        "type": "workflow_completed",
        "old_status": WorkflowStatusEnum.ACTIVE,
        "new_status": WorkflowStatusEnum.COMPLETED,
        "timestamp": None,
    },
]


def test_sequential_workflow(sequential_workflow_view, runner):
    runner_calls = [
        (runner.advance, slice(0, 3)),
        (runner.complete_current_step, slice(3, 4)),
        (runner.advance, slice(4, 6)),
        (runner.complete_current_step, slice(6, 7)),
        (runner.advance, slice(7, 9)),
    ]

    for runner_fn, s in runner_calls:
        events = runner_fn(sequential_workflow_view)
        assert events == EXPECTED_EVENTS_FOR_COMPLETED_SEQUENTIAL_WORKFLOW[s]
        apply_events(events, sequential_workflow_view)


def test_override_current_step_throws_error(runner):
    with pytest.raises(NotImplementedError):
        runner.override_current_step("si-2")


def test_complete_current_step_before_workflow_started_throws_error(
    sequential_workflow_view, runner
):
    with pytest.raises(AssertionError) as e:
        runner.complete_current_step(sequential_workflow_view)

    assert "current_step_id" in str(e)


def test_complete_current_step_after_workflow_completed_throws_error(
    sequential_workflow_view, runner
):
    runner_calls = [
        runner.advance,
        runner.complete_current_step,
        runner.advance,
        runner.complete_current_step,
        runner.advance,
    ]

    for runner_fn in runner_calls:
        events = runner_fn(sequential_workflow_view)
        apply_events(events, sequential_workflow_view)

    with pytest.raises(AssertionError) as e:
        runner.complete_current_step(sequential_workflow_view)

    assert "current_step_id" in str(e)


def test_advance_workflow_without_applying_events(sequential_workflow_view, runner):
    events = runner.advance(sequential_workflow_view)
    assert events == EXPECTED_EVENTS_FOR_COMPLETED_SEQUENTIAL_WORKFLOW[0:3]

    # Events haven't been applied, next advance will produce the same events
    # Shows the runner is stateless
    events = runner.advance(sequential_workflow_view)
    assert events == EXPECTED_EVENTS_FOR_COMPLETED_SEQUENTIAL_WORKFLOW[0:3]
