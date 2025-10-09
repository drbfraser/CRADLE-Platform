import pytest
from pydantic import ValidationError

from tests.validation.test_workflow_models import (
    TIMESTAMP_TODAY,
    TIMESTAMP_TOMORROW,
    TIMESTAMP_YESTERDAY,
    make_workflow_instance_step,
    make_workflow_template_step,
)
from validation.workflow_api_models import (
    WorkflowInstancePatchModel,
    WorkflowTemplatePatchBody,
)


def make_workflow_template_patch(**overrides):
    base = {
        "id": "workflow-template-1",
        "name": "Workflow 1",
        "description": "Description",
        "archived": False,
        "starting_step_id": None,
        "date_created": TIMESTAMP_TODAY,
        "last_edited": TIMESTAMP_TOMORROW,
        "version": "0",
        "steps": [],
    }
    return {**base, **overrides}


def make_workflow_instance_patch(**overrides):
    base = {
        "id": "workflow-instance-1",
        "name": "Workflow 1",
        "description": "Description",
        "start_date": TIMESTAMP_TODAY,
        "current_step_id": None,
        "last_edited": TIMESTAMP_TOMORROW,
        "completion_date": TIMESTAMP_TOMORROW,
        "status": "Completed",
        "workflow_template_id": "workflow-instance-1",
        "patient_id": "125",
        "steps": [],
    }
    return {**base, **overrides}


### WorkflowTemplatePatchBody ###


def test__workflow_template_patch__valid():
    patch_json = make_workflow_template_patch()
    patch_model = WorkflowTemplatePatchBody(**patch_json)

    assert patch_model.id == "workflow-template-1"


@pytest.mark.parametrize(
    "optional_field",
    [
        "id",
        "name",
        "description",
        "archived",
        "starting_step_id",
        "last_edited",
        "classification_id",
        "classification",
        "steps",
    ],
)
def test__workflow_template_patch__optional_fields_missing(optional_field: str):
    patch_json = make_workflow_template_patch()
    patch_json.pop(optional_field, None)

    WorkflowTemplatePatchBody(**patch_json)


def test__workflow_template_patch__with_steps():
    step_json = make_workflow_template_step()
    patch_json = make_workflow_template_patch(steps=[step_json])

    patch_model = WorkflowTemplatePatchBody(**patch_json)
    assert patch_model.steps[0].id == "workflow-template-step-1"


@pytest.mark.parametrize(
    "field, value, error_message",
    [
        ("last_edited", TIMESTAMP_YESTERDAY, "last_edited cannot be before date_created"),
    ],
)
def test__workflow_template_patch__invalid_dates(
    field: str, value: str, error_message: str
):
    patch_json = make_workflow_template_patch(**{field: value})

    with pytest.raises(ValidationError) as e:
        WorkflowTemplatePatchBody(**patch_json)

    assert error_message in str(e.value)


### WorkflowInstancePatchModel ###


def test__workflow_instance_patch__valid():
    patch_json = make_workflow_instance_patch()
    patch_model = WorkflowInstancePatchModel(**patch_json)

    assert patch_model.id == "workflow-instance-1"


@pytest.mark.parametrize(
    "optional_field",
    [
        "id",
        "name",
        "description",
        "start_date",
        "current_step_id",
        "last_edited",
        "completion_date",
        "status",
        "workflow_template_id",
        "patient_id",
        "steps",
    ],
)
def test__workflow_instance_patch__optional_fields_missing(optional_field: str):
    patch_json = make_workflow_instance_patch()
    patch_json.pop(optional_field, None)

    WorkflowInstancePatchModel(**patch_json)


def test__workflow_instance_patch__with_steps():
    step_json = make_workflow_instance_step()
    patch_json = make_workflow_instance_patch(steps=[step_json])

    patch_model = WorkflowInstancePatchModel(**patch_json)
    assert patch_model.steps[0].id == "workflow-instance-step-1"


@pytest.mark.parametrize(
    "field, value, error_message",
    [
        ("last_edited", TIMESTAMP_YESTERDAY, "last_edited cannot be before start_date"),
        (
            "completion_date",
            TIMESTAMP_YESTERDAY,
            "completion_date cannot be before start_date",
        ),
    ],
)
def test__workflow_instance_patch__invalid_dates(
    field: str, value: str, error_message: str
):
    patch_json = make_workflow_instance_patch(**{field: value})

    with pytest.raises(ValidationError) as e:
        WorkflowInstancePatchModel(**patch_json)

    assert error_message in str(e.value)
