import json
import pytest

from pydantic import ValidationError

from validation.workflow_models import (
    WorkflowTemplateModel,
    WorkflowTemplateStepModel,
    WorkflowInstanceModel,
    WorkflowInstanceStepModel,
)
from tests.validation.test_form_templates import (
    template_with_valid_fields_and_one_question_should_return_none,
)
from tests.validation.test_forms import form_with_valid_fields_should_return_none


@pytest.fixture
def template_form():
    return template_with_valid_fields_and_one_question_should_return_none


@pytest.fixture
def form():
    return form_with_valid_fields_should_return_none


@pytest.fixture
def classification():
    return {
        "id": "classification-1",
        "name": "Classification 1",
        "collection_id": None,
    }


@pytest.fixture
def workflow_template_step_factory(template_form):
    def _make(**overrides):
        base = {
            "id": "workflow-template-step-1",
            "name": "Step 1",
            "description": "Description",
            "workflow_template_id": "workflow-template-1",
            "last_edited": "1759330125",
            "expected_completion": "1759848525",
            "form_id": template_form["id"],
            "form": template_form,
            "branches": [],
        }
        return {**base, **overrides}

    return _make


@pytest.fixture
def workflow_instance_step_factory(form):
    def _make(**overrides):
        base = {
            "id": "workflow-instance-step-1",
            "name": "Step 1",
            "description": "Description",
            "start_date": "1759330125",
            "last_edited": "1759848525",
            "assigned_to": "125",
            "completion_date": "1759848525",
            "expected_completion": "1759848525",
            "status": "Active",
            "data": json.dumps({"x": "y"}),
            "form_id": form["id"],
            "form": form,
            "workflow_instance_id": "workflow-instance-1",
        }
        return {**base, **overrides}

    return _make


@pytest.fixture
def workflow_template_factory(classification):
    def _make(**overrides):
        base = {
            "id": "workflow-template-1",
            "name": "Workflow 1",
            "description": "Description",
            "archived": False,
            "starting_step_id": None,
            "date_created": "1759330125",
            "last_edited": "1759330125",
            "version": "0",
            "classification_id": classification["id"],
            "classification": classification,
            "steps": [],
        }
        return {**base, **overrides}

    return _make


@pytest.fixture
def workflow_instance_factory():
    def _make(**overrides):
        base = {
            "id": "workflow-instance-1",
            "name": "Workflow 1",
            "description": "Description",
            "start_date": "1759330125",
            "current_step_id": None,
            "last_edited": "1759848525",
            "completion_date": "1759848525",
            "status": "Completed",
            "workflow_template_id": "workflow-instance-1",
            "patient_id": "125",
            "steps": [],
        }
        return {**base, **overrides}

    return _make


### WorkflowTemplateStepModel ###


def test__workflow_template_step__valid(workflow_template_step_factory):
    step_json = workflow_template_step_factory()
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
def test__workflow_template_step__missing_required_fields(
    workflow_template_step_factory, required_field: str
):
    step_json = workflow_template_step_factory()
    del step_json[required_field]

    with pytest.raises(ValidationError):
        WorkflowTemplateStepModel(**step_json)


@pytest.mark.parametrize(
    "optional_field",
    [
        "expected_completion",
        "last_edited",
        "form_id",
        "form",
    ],
)
def test__workflow_template_step__missing_optional_fields(
    workflow_template_step_factory, optional_field: str
):
    step_json = workflow_template_step_factory()
    del step_json[optional_field]

    step_model = WorkflowTemplateStepModel(**step_json)
    assert step_model.id == "workflow-template-step-1"


def test__workflow_template_step__extra_field(workflow_template_step_factory):
    step_json = workflow_template_step_factory()
    step_json["extra"] = "nope"

    with pytest.raises(ValidationError):
        WorkflowTemplateStepModel(**step_json)


### WorkflowTemplateModel ###


def test__workflow_template__valid(workflow_template_factory):
    workflow_json = workflow_template_factory()
    workflow_model = WorkflowTemplateModel(**workflow_json)
    # sanity check
    assert workflow_model.id == "workflow-template-1"


def test__workflow_template__with_steps(
    workflow_template_factory, workflow_template_step_factory
):
    step_1_json = workflow_template_step_factory(id="workflow-template-step-1")
    step_2_json = workflow_template_step_factory(id="workflow-template-step-2")
    workflow_json = workflow_template_factory(steps=[step_1_json, step_2_json])

    workflow_model = WorkflowTemplateModel(**workflow_json)
    # sanity check
    assert workflow_model.id == "workflow-template-1"
    assert workflow_model.steps[0].id == "workflow-template-step-1"
    assert workflow_model.steps[1].id == "workflow-template-step-2"


def test__workflow_template__invalid_step(
    workflow_template_factory, workflow_template_step_factory
):
    step_json = workflow_template_step_factory(extra="nope")
    workflow_json = workflow_template_factory(steps=[step_json])

    with pytest.raises(ValidationError):
        WorkflowTemplateModel(**workflow_json)


@pytest.mark.parametrize(
    "required_field",
    [
        "id",
        "name",
        "archived",
        "date_created",
        "version",
        "steps",
    ],
)
def test__workflow_template__missing_required_fields(
    workflow_template_factory, required_field: str
):
    workflow_json = workflow_template_factory()
    del workflow_json[required_field]

    with pytest.raises(ValidationError):
        WorkflowTemplateModel(**workflow_json)


@pytest.mark.parametrize(
    "optional_field",
    [
        "starting_step_id",
        "last_edited",
        "classification_id",
        "classification",
    ],
)
def test__workflow_template__missing_optional_fields(
    workflow_template_factory, optional_field: str
):
    workflow_json = workflow_template_factory()
    del workflow_json[optional_field]

    workflow_model = WorkflowTemplateModel(**workflow_json)
    assert workflow_model.id == "workflow-template-1"


def test__workflow_template__extra_field(workflow_template_factory):
    workflow_json = workflow_template_factory(extra="nope")

    with pytest.raises(ValidationError):
        WorkflowTemplateModel(**workflow_json)


def test__workflow_template__invalid_dates(workflow_template_factory):
    workflow_json = workflow_template_factory(last_edited="1759243725")

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateModel(**workflow_json)

    assert "last_edited cannot be before date_created" in str(e)


### WorkflowInstanceStepModel ###


def test__workflow_instance_step__valid(workflow_instance_step_factory):
    step_json = workflow_instance_step_factory()
    step_model = WorkflowInstanceStepModel(**step_json)
    # sanity check
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
def test__workflow_instance_step__missing_required_fields(
    workflow_instance_step_factory, required_field: str
):
    step_json = workflow_instance_step_factory()
    del step_json[required_field]

    with pytest.raises(ValidationError):
        WorkflowInstanceStepModel(**step_json)


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
def test__workflow_instance_step__missing_optional_fields(
    workflow_instance_step_factory, optional_field: str
):
    step_json = workflow_instance_step_factory()
    del step_json[optional_field]

    step_model = WorkflowInstanceStepModel(**step_json)
    assert step_model.id == "workflow-instance-step-1"


def test__workflow_instance_step__extra_field(workflow_instance_step_factory):
    step_json = workflow_instance_step_factory()
    step_json["extra"] = "nope"

    with pytest.raises(ValidationError):
        WorkflowInstanceStepModel(**step_json)


@pytest.mark.parametrize(
    "field, value, error_message",
    [
        ("last_edited", "1759243725", "last_edited cannot be before start_date"),
        (
            "completion_date",
            "1759243725",
            "completion_date cannot be before start_date",
        ),
        (
            "expected_completion",
            "1759243725",
            "expected_completion cannot be before start_date",
        ),
    ],
)
def test__workflow_instance_step__invalid_dates(
    workflow_instance_step_factory, field: str, value: str, error_message: str
):
    step_json = workflow_instance_step_factory(**{field: value})

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceStepModel(**step_json)

    assert error_message in str(e.value)


def test__workflow_instance_step__invalid_status(workflow_instance_step_factory):
    step_json = workflow_instance_step_factory(status="Done")

    with pytest.raises(ValidationError):
        WorkflowInstanceStepModel(**step_json)


### WorkflowInstanceModel ###


def test__workflow_instance__valid(workflow_instance_factory):
    workflow_json = workflow_instance_factory()
    workflow_model = WorkflowInstanceModel(**workflow_json)
    # sanity check
    assert workflow_model.id == "workflow-instance-1"


def test__workflow_instance__with_steps(
    workflow_instance_factory, workflow_instance_step_factory
):
    step_1_json = workflow_instance_step_factory(id="workflow-instance-step-1")
    step_2_json = workflow_instance_step_factory(id="workflow-instance-step-2")
    workflow_json = workflow_instance_factory(steps=[step_1_json, step_2_json])

    workflow_model = WorkflowInstanceModel(**workflow_json)
    # sanity check
    assert workflow_model.id == "workflow-instance-1"
    assert workflow_model.steps[0].id == "workflow-instance-step-1"
    assert workflow_model.steps[1].id == "workflow-instance-step-2"


def test__workflow_instance__invalid_step(
    workflow_instance_factory, workflow_instance_step_factory
):
    step_json = workflow_instance_step_factory(extra="nope")
    workflow_json = workflow_instance_factory(steps=[step_json])

    with pytest.raises(ValidationError):
        WorkflowInstanceModel(**workflow_json)


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
def test__workflow_instance__missing_required_fields(
    workflow_instance_factory, required_field: str
):
    workflow_json = workflow_instance_factory()
    del workflow_json[required_field]

    with pytest.raises(ValidationError):
        WorkflowInstanceModel(**workflow_json)


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
def test__workflow_template__missing_optional_fields(
    workflow_instance_factory, optional_field: str
):
    workflow_json = workflow_instance_factory()
    del workflow_json[optional_field]

    workflow_model = WorkflowInstanceModel(**workflow_json)
    assert workflow_model.id == "workflow-instance-1"


def test__workflow_instance__extra_field(workflow_instance_factory):
    workflow_json = workflow_instance_factory(extra="nope")

    with pytest.raises(ValidationError):
        WorkflowInstanceModel(**workflow_json)


@pytest.mark.parametrize(
    "field, value, error_message",
    [
        ("last_edited", "1759243725", "last_edited cannot be before start_date"),
        (
            "completion_date",
            "1759243725",
            "completion_date cannot be before start_date",
        ),
    ],
)
def test__workflow_instance__invalid_dates(
    workflow_instance_factory, field: str, value: str, error_message: str
):
    workflow_json = workflow_instance_factory(**{field: value})

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceModel(**workflow_json)

    assert error_message in str(e.value)


def test__workflow_instance__invalid_status(workflow_instance_factory):
    workflow_json = workflow_instance_factory(status="Done")

    with pytest.raises(ValidationError):
        WorkflowInstanceModel(**workflow_json)
