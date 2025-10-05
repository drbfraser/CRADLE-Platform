from typing import Optional

import pytest

from service.workflow.workflow_runner import (
    WorkflowEventType,
    WorkflowRunner,
    WorkflowStatus,
)


def basic_workflow_template() -> dict:
    return {
        "start_step_id": "step_1",
        "steps": {
            "step_1": {"next_step_id": "step_2"},
            "step_2": {"next_step_id": None},
        },
    }


def basic_workflow_instance() -> dict:
    """Initial workflow instance"""
    return {
        "status": WorkflowStatus.NOT_STARTED,
        "current_step_id": None,
        "steps": {
            "step_1": {"status": WorkflowStatus.NOT_STARTED},
            "step_2": {"status": WorkflowStatus.NOT_STARTED},
        },
    }


def make_runner(
    template: Optional[dict] = None, instance: Optional[dict] = None
) -> WorkflowRunner:
    return WorkflowRunner(
        template=template if template else basic_workflow_template(),
        instance=instance if instance else basic_workflow_instance(),
        record_timestamps_for_events=False,  # Easier to validate events without timestamps
    )


EXPECTED_EVENTS_FOR_COMPLETED_BASIC_WORKFLOW = [
    {
        "type": WorkflowEventType.WORKFLOW_STARTED,
        "old_status": WorkflowStatus.NOT_STARTED,
        "new_status": WorkflowStatus.STARTED,
    },
    {
        "type": WorkflowEventType.STEP_TRANSITION,
        "from_step": None,
        "to_step": "step_1",
    },
    {
        "type": WorkflowEventType.STEP_STARTED,
        "step_id": "step_1",
        "old_status": WorkflowStatus.NOT_STARTED,
        "new_status": WorkflowStatus.STARTED,
    },
    {
        "type": WorkflowEventType.STEP_COMPLETED,
        "step_id": "step_1",
        "old_status": WorkflowStatus.STARTED,
        "new_status": WorkflowStatus.COMPLETED,
    },
    {
        "type": WorkflowEventType.STEP_TRANSITION,
        "from_step": "step_1",
        "to_step": "step_2",
    },
    {
        "type": WorkflowEventType.STEP_STARTED,
        "step_id": "step_2",
        "old_status": WorkflowStatus.NOT_STARTED,
        "new_status": WorkflowStatus.STARTED,
    },
    {
        "type": WorkflowEventType.STEP_COMPLETED,
        "step_id": "step_2",
        "old_status": WorkflowStatus.STARTED,
        "new_status": WorkflowStatus.COMPLETED,
    },
    {
        "type": WorkflowEventType.STEP_TRANSITION,
        "from_step": "step_2",
        "to_step": None,
    },
    {
        "type": "workflow_completed",
        "old_status": WorkflowStatus.STARTED,
        "new_status": WorkflowStatus.COMPLETED,
    },
]


def test_sequential_workflow():
    runner = make_runner()

    runner.start_workflow()

    assert runner.instance["status"] == WorkflowStatus.STARTED
    assert runner.instance["current_step_id"] == "step_1"
    assert runner.instance["steps"]["step_1"]["status"] == WorkflowStatus.STARTED
    assert runner.instance["steps"]["step_2"]["status"] == WorkflowStatus.NOT_STARTED

    runner.complete_current_step()

    assert runner.instance["status"] == WorkflowStatus.STARTED
    assert runner.instance["current_step_id"] == "step_2"
    assert runner.instance["steps"]["step_1"]["status"] == WorkflowStatus.COMPLETED
    assert runner.instance["steps"]["step_2"]["status"] == WorkflowStatus.STARTED

    runner.complete_current_step()

    assert runner.instance["status"] == WorkflowStatus.COMPLETED
    assert runner.instance["current_step_id"] == None
    assert runner.instance["steps"]["step_1"]["status"] == WorkflowStatus.COMPLETED
    assert runner.instance["steps"]["step_2"]["status"] == WorkflowStatus.COMPLETED

    assert runner.events == EXPECTED_EVENTS_FOR_COMPLETED_BASIC_WORKFLOW


def test_override_current_step_fails():
    runner = make_runner()

    with pytest.raises(NotImplementedError):
        runner.override_current_step("step_2")

    # Workflow instance should be unaffected
    assert runner.instance["status"] == WorkflowStatus.NOT_STARTED
    assert runner.instance["current_step_id"] == None
    assert runner.instance["steps"]["step_1"]["status"] == WorkflowStatus.NOT_STARTED
    assert runner.instance["steps"]["step_2"]["status"] == WorkflowStatus.NOT_STARTED

    # Events should be unaffected
    assert runner.events == []


def test_complete_current_step_before_workflow_started_fails():
    runner = make_runner()

    with pytest.raises(AssertionError) as e:
        runner.complete_current_step()

    assert "Cannot complete step" in str(e)

    # Workflow instance should be unaffected
    assert runner.instance["status"] == WorkflowStatus.NOT_STARTED
    assert runner.instance["current_step_id"] == None
    assert runner.instance["steps"]["step_1"]["status"] == WorkflowStatus.NOT_STARTED
    assert runner.instance["steps"]["step_2"]["status"] == WorkflowStatus.NOT_STARTED

    # Events should be unaffected
    assert runner.events == []


def test_complete_current_step_after_workflow_completed_fails():
    runner = make_runner()

    runner.start_workflow()
    runner.complete_current_step()
    runner.complete_current_step()

    with pytest.raises(AssertionError) as e:
        runner.complete_current_step()

    assert "Cannot complete step" in str(e)

    # Workflow instance should be unaffected
    assert runner.instance["status"] == WorkflowStatus.COMPLETED
    assert runner.instance["current_step_id"] == None
    assert runner.instance["steps"]["step_1"]["status"] == WorkflowStatus.COMPLETED
    assert runner.instance["steps"]["step_2"]["status"] == WorkflowStatus.COMPLETED

    # Events should be unaffected
    assert runner.events == EXPECTED_EVENTS_FOR_COMPLETED_BASIC_WORKFLOW


def test_start_workflow_twice_fails():
    runner = make_runner()

    runner.start_workflow()

    with pytest.raises(AssertionError) as e:
        runner.start_workflow()

    assert "Workflow can only be started once" in str(e)

    # Workflow instance should be unaffected
    assert runner.instance["status"] == WorkflowStatus.STARTED
    assert runner.instance["current_step_id"] == "step_1"
    assert runner.instance["steps"]["step_1"]["status"] == WorkflowStatus.STARTED
    assert runner.instance["steps"]["step_2"]["status"] == WorkflowStatus.NOT_STARTED

    # Events should be unaffected
    assert runner.events == EXPECTED_EVENTS_FOR_COMPLETED_BASIC_WORKFLOW[0:3]


def test_sequential_workflow_across_multiple_runners():
    # Tests a more realistic usage of the class, where a new runner would be used
    # per API call to complete a step
    runner1 = make_runner()

    runner1.start_workflow()

    assert runner1.instance["status"] == WorkflowStatus.STARTED
    assert runner1.instance["current_step_id"] == "step_1"
    assert runner1.instance["steps"]["step_1"]["status"] == WorkflowStatus.STARTED
    assert runner1.instance["steps"]["step_2"]["status"] == WorkflowStatus.NOT_STARTED

    runner2 = make_runner(runner1.template, runner1.instance)

    runner2.complete_current_step()

    assert runner2.instance["status"] == WorkflowStatus.STARTED
    assert runner2.instance["current_step_id"] == "step_2"
    assert runner2.instance["steps"]["step_1"]["status"] == WorkflowStatus.COMPLETED
    assert runner2.instance["steps"]["step_2"]["status"] == WorkflowStatus.STARTED

    runner3 = make_runner(runner2.template, runner2.instance)

    runner3.complete_current_step()

    assert runner3.instance["status"] == WorkflowStatus.COMPLETED
    assert runner3.instance["current_step_id"] == None
    assert runner3.instance["steps"]["step_1"]["status"] == WorkflowStatus.COMPLETED
    assert runner3.instance["steps"]["step_2"]["status"] == WorkflowStatus.COMPLETED

    # Events recorded from runners 1 and 2 will be lost of course
    # Caller should persist the runner's events if needed
    assert runner3.events == EXPECTED_EVENTS_FOR_COMPLETED_BASIC_WORKFLOW[6:9]
