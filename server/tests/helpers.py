from common.commonUtil import get_current_time, get_uuid

TIMESTAMP_TODAY = get_current_time()
TIMESTAMP_TOMORROW = get_current_time() + 86400
TIMESTAMP_YESTERDAY = get_current_time() - 86400


def make_workflow_template(**overrides):
    base = {
        "id": get_uuid(),
        "name": "Test Workflow",
        "description": "This is a workflow template for testing.",
        "archived": False,
        "starting_step_id": None,
        "date_created": TIMESTAMP_TODAY,
        "last_edited": TIMESTAMP_TODAY,
        "version": "0",
        "steps": [],
    }
    return {**base, **overrides}


def make_workflow_template_step(**overrides):
    base = {
        "id": get_uuid(),
        "name": "Test Step",
        "description": "This is a workflow template step for testing.",
        "workflow_template_id": None,
        "last_edited": TIMESTAMP_TODAY,
        "expected_completion": TIMESTAMP_TOMORROW,
        "form_id": None,
        "form": None,
        "branches": [],
    }
    return {**base, **overrides}


def make_workflow_template_branch(**overrides):
    base = {
        "id": get_uuid(),
        "target_step_id": None,
        "step_id": None,
        "condition_id": None,
        "condition": None,
    }
    return {**base, **overrides}


def make_workflow_instance(**overrides):
    base = {
        "id": get_uuid(),
        "name": "Test Workflow",
        "description": "This is a workflow instance for testing.",
        "start_date": TIMESTAMP_TODAY,
        "current_step_id": None,
        "last_edited": TIMESTAMP_TODAY,
        "completion_date": TIMESTAMP_TOMORROW,
        "status": "Active",
        "workflow_template_id": None,
        "patient_id": None,
        "steps": [],
    }
    return {**base, **overrides}


def make_workflow_instance_step(**overrides):
    base = {
        "id": get_uuid(),
        "name": "Test Step",
        "description": "This is a workflow instance step for testing.",
        "start_date": TIMESTAMP_TODAY,
        "last_edited": TIMESTAMP_TODAY,
        "assigned_to": None,
        "completion_date": TIMESTAMP_TOMORROW,
        "expected_completion": TIMESTAMP_TOMORROW,
        "status": "Active",
        "data": None,
        "form_id": None,
        "form": None,
        "workflow_instance_id": None,
    }
    return {**base, **overrides}
