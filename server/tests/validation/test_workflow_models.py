import json

import pytest
from pydantic import ValidationError

from common.commonUtil import get_current_time
from tests.validation.test_form_templates import (
    template_with_valid_fields_and_one_question_should_return_none,
)
from tests.validation.test_forms import form_with_valid_fields_should_return_none
from validation.workflow_models import (
    WorkflowInstanceModel,
    WorkflowInstanceStepModel,
    WorkflowTemplateModel,
    WorkflowTemplateStepModel,
)

# TODO: Move these into a utils file?
TIMESTAMP_TODAY = get_current_time()
TIMESTAMP_TOMORROW = get_current_time() + 86400
TIMESTAMP_YESTERDAY = get_current_time() - 86400


def get_template_form() -> dict:
    return template_with_valid_fields_and_one_question_should_return_none


def get_form() -> dict:
    return form_with_valid_fields_should_return_none


def make_workflow_template_step(**overrides):
    template_form = get_template_form()
    base = {
        "id": "workflow-template-step-1",
        "name": "Step 1",
        "description": "Description",
        "workflow_template_id": "workflow-template-1",
        "last_edited": TIMESTAMP_TOMORROW,
        "expected_completion": TIMESTAMP_TOMORROW,
        "form_id": template_form["id"],
        "form": template_form,
        "branches": [],
    }
    return {**base, **overrides}


def make_workflow_instance_step(**overrides):
    form = get_form()
    base = {
        "id": "workflow-instance-step-1",
        "name": "Step 1",
        "description": "Description",
        "start_date": TIMESTAMP_TODAY,
        "last_edited": TIMESTAMP_TOMORROW,
        "assigned_to": "125",
        "completion_date": TIMESTAMP_TOMORROW,
        "expected_completion": TIMESTAMP_TOMORROW,
        "status": "Active",
        "data": json.dumps({"x": "y"}),
        "form_id": form["id"],
        "form": form,
        "workflow_instance_id": "workflow-instance-1",
    }

    return {**base, **overrides}


def make_workflow_template(**overrides):
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


def make_workflow_instance(**overrides):
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


### WorkflowTemplateStepModel ###


def test__workflow_template_step__valid():
    step_json = make_workflow_template_step()
    step_model = WorkflowTemplateStepModel(**step_json)

    # sanity check
    assert step_model.id == "workflow-template-step-1"


@pytest.mark.parametrize(
    "required_field",
    [
        "id",
        "name",
        "description",
        "workflow_template_id",
    ],
)
def test__workflow_template_step__missing_required_fields(required_field: str):
    step_json = make_workflow_template_step()
    step_json.pop(required_field)

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateStepModel(**step_json)

    assert "Field required" in str(e)


@pytest.mark.parametrize(
    "optional_field",
    [
        "expected_completion",
        "last_edited",
        "form_id",
        "form",
    ],
)
def test__workflow_template_step__missing_optional_fields(optional_field: str):
    step_json = make_workflow_template_step()
    step_json.pop(optional_field)

    step_model = WorkflowTemplateStepModel(**step_json)
    assert step_model.id == "workflow-template-step-1"


def test__workflow_template_step__extra_field():
    step_json = make_workflow_template_step()
    step_json["extra"] = "nope"

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateStepModel(**step_json)

    assert "Extra inputs are not permitted" in (str(e))


### WorkflowTemplateModel ###


def test__workflow_template__valid():
    workflow_json = make_workflow_template()
    workflow_model = WorkflowTemplateModel(**workflow_json)

    assert workflow_model.id == "workflow-template-1"


def test__workflow_template__with_steps():
    step_1_json = make_workflow_template_step(id="workflow-template-step-1")
    step_2_json = make_workflow_template_step(id="workflow-template-step-2")
    workflow_json = make_workflow_template(steps=[step_1_json, step_2_json])

    workflow_model = WorkflowTemplateModel(**workflow_json)

    assert workflow_model.id == "workflow-template-1"
    assert workflow_model.steps[0].id == "workflow-template-step-1"
    assert workflow_model.steps[1].id == "workflow-template-step-2"


def test__workflow_template__invalid_step():
    step_json = make_workflow_template_step(extra="nope")
    workflow_json = make_workflow_template(steps=[step_json])

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateModel(**workflow_json)

    assert "Extra inputs are not permitted" in (str(e))


@pytest.mark.parametrize(
    "required_field",
    [
        "id",
        "name",
        "archived",
        "version",
        "steps",
    ],
)
def test__workflow_template__missing_required_fields(required_field: str):
    workflow_json = make_workflow_template()
    workflow_json.pop(required_field)

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateModel(**workflow_json)

    assert "Field required" in str(e)


@pytest.mark.parametrize(
    "optional_field",
    [
        "starting_step_id",
        "last_edited",
        "classification_id",
        "classification",
    ],
)
def test__workflow_template__missing_optional_fields(optional_field: str):
    workflow_json = make_workflow_template()
    workflow_json.pop(optional_field, None)

    workflow_model = WorkflowTemplateModel(**workflow_json)
    assert workflow_model.id == "workflow-template-1"


def test__workflow_template__extra_field():
    workflow_json = make_workflow_template(extra="nope")

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateModel(**workflow_json)

    assert "Extra inputs are not permitted" in (str(e))


def test__workflow_template__invalid_dates():
    workflow_json = make_workflow_template(last_edited=get_current_time() - 86400)

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateModel(**workflow_json)

    assert "last_edited cannot be before date_created" in str(e)


### WorkflowInstanceStepModel ###


def test__workflow_instance_step__valid():
    step_json = make_workflow_instance_step()
    step_model = WorkflowInstanceStepModel(**step_json)

    assert step_model.id == "workflow-instance-step-1"


@pytest.mark.parametrize(
    "required_field",
    [
        "id",
        "name",
        "description",
        "workflow_instance_id",
    ],
)
def test__workflow_instance_step__missing_required_fields(required_field: str):
    step_json = make_workflow_instance_step()
    step_json.pop(required_field, None)

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceStepModel(**step_json)

    assert "Field required" in str(e)


@pytest.mark.parametrize(
    "optional_field",
    [
        "last_edited",
        "assigned_to",
        "completion_date",
        "expected_completion",
        "data",
        "form_id",
        "form",
    ],
)
def test__workflow_instance_step__missing_optional_fields(optional_field: str):
    step_json = make_workflow_instance_step()
    step_json.pop(optional_field)

    step_model = WorkflowInstanceStepModel(**step_json)
    assert step_model.id == "workflow-instance-step-1"


def test__workflow_instance_step__extra_field():
    step_json = make_workflow_instance_step()
    step_json["extra"] = "nope"

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceStepModel(**step_json)

    assert "Extra inputs are not permitted" in (str(e))


@pytest.mark.parametrize(
    "field, value, error_message",
    [
        ("last_edited", TIMESTAMP_YESTERDAY, "last_edited cannot be before start_date"),
        (
            "completion_date",
            TIMESTAMP_YESTERDAY,
            "completion_date cannot be before start_date",
        ),
        (
            "expected_completion",
            TIMESTAMP_YESTERDAY,
            "expected_completion cannot be before start_date",
        ),
    ],
)
def test__workflow_instance_step__invalid_dates(
    field: str, value: str, error_message: str
):
    step_json = make_workflow_instance_step(**{field: value})

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceStepModel(**step_json)

    assert error_message in str(e.value)


def test__workflow_instance_step__invalid_status():
    step_json = make_workflow_instance_step(status="Done")

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceStepModel(**step_json)

    assert "Input should be" in str(e)


### WorkflowInstanceModel ###


def test__workflow_instance__valid():
    workflow_json = make_workflow_instance()
    workflow_model = WorkflowInstanceModel(**workflow_json)

    assert workflow_model.id == "workflow-instance-1"


def test__workflow_instance__with_steps():
    step_1_json = make_workflow_instance_step(id="workflow-instance-step-1")
    step_2_json = make_workflow_instance_step(id="workflow-instance-step-2")
    workflow_json = make_workflow_instance(steps=[step_1_json, step_2_json])

    workflow_model = WorkflowInstanceModel(**workflow_json)

    assert workflow_model.id == "workflow-instance-1"
    assert workflow_model.steps[0].id == "workflow-instance-step-1"
    assert workflow_model.steps[1].id == "workflow-instance-step-2"


def test__workflow_instance__invalid_step():
    step_json = make_workflow_instance_step(extra="nope")
    workflow_json = make_workflow_instance(steps=[step_json])

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceModel(**workflow_json)

    assert "Extra inputs are not permitted" in (str(e))


@pytest.mark.parametrize(
    "required_field",
    [
        "id",
        "name",
        "description",
        "status",
        "patient_id",
        "steps",
    ],
)
def test__workflow_instance__missing_required_fields(required_field: str):
    workflow_json = make_workflow_instance()
    workflow_json.pop(required_field)

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceModel(**workflow_json)

    assert "Field required" in str(e)


@pytest.mark.parametrize(
    "optional_field",
    [
        "start_date",
        "current_step_id",
        "last_edited",
        "completion_date",
        "workflow_template_id",
    ],
)
def test__workflow_instance__missing_optional_fields(optional_field: str):
    workflow_json = make_workflow_instance()
    workflow_json.pop(optional_field)

    workflow_model = WorkflowInstanceModel(**workflow_json)
    assert workflow_model.id == "workflow-instance-1"


def test__workflow_instance__extra_field():
    workflow_json = make_workflow_instance(extra="nope")

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceModel(**workflow_json)

    assert "Extra inputs are not permitted" in (str(e))


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
def test__workflow_instance__invalid_dates(field: str, value: str, error_message: str):
    workflow_json = make_workflow_instance(**{field: value})

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceModel(**workflow_json)

    assert error_message in str(e.value)


def test__workflow_instance__invalid_status():
    workflow_json = make_workflow_instance(status="Done")

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceModel(**workflow_json)

    assert "Input should be" in str(e)
