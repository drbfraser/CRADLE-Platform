import pytest
from pydantic import ValidationError

from tests.helpers import (
    TIMESTAMP_YESTERDAY,
    make_workflow_instance,
    make_workflow_instance_step,
    make_workflow_template,
    make_workflow_template_step,
)
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


def get_template_form() -> dict:
    return template_with_valid_fields_and_one_question_should_return_none


def get_form() -> dict:
    return form_with_valid_fields_should_return_none


### WorkflowTemplateStepModel ###


def test__workflow_template_step__valid():
    step_json = make_workflow_template_step(id="s-1", workflow_template_id="wt-1")
    step_model = WorkflowTemplateStepModel(**step_json)

    # sanity check
    assert step_model.id == "s-1"


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
    step_json = make_workflow_template_step(id="s-1", workflow_template_id="wt-1")
    step_json.pop(required_field)

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateStepModel(**step_json)

    assert "Field required" in str(e)


def test__workflow_template_step__extra_field():
    step_json = make_workflow_template_step(id="s-1", workflow_template_id="wt-1")
    step_json["extra"] = "nope"

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateStepModel(**step_json)

    assert "Extra inputs are not permitted" in (str(e))


# ### WorkflowTemplateModel ###


def test__workflow_template__valid():
    workflow_json = make_workflow_template(id="wt-1")
    workflow_model = WorkflowTemplateModel(**workflow_json)

    assert workflow_model.id == "wt-1"


def test__workflow_template__with_steps():
    step_1_json = make_workflow_template_step(id="s-1", workflow_template_id="wt-1")
    step_2_json = make_workflow_template_step(id="s-2", workflow_template_id="wt-1")
    workflow_json = make_workflow_template(id="wt-1", steps=[step_1_json, step_2_json])

    workflow_model = WorkflowTemplateModel(**workflow_json)

    assert workflow_model.id == "wt-1"
    assert workflow_model.steps[0].id == "s-1"
    assert workflow_model.steps[1].id == "s-2"


def test__workflow_template__invalid_step():
    step_json = make_workflow_template_step(id="s-1", workflow_template_id="wt-1")
    step_json["extra"] = "nope"
    workflow_json = make_workflow_template(id="wt-1", steps=[step_json])

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
    workflow_json = make_workflow_template(id="wt-1")
    workflow_json.pop(required_field)

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateModel(**workflow_json)

    assert "Field required" in str(e)


def test__workflow_template__extra_field():
    workflow_json = make_workflow_template(id="wt-1", extra="nope")

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateModel(**workflow_json)

    assert "Extra inputs are not permitted" in (str(e))


def test__workflow_template__invalid_dates():
    workflow_json = make_workflow_template(id="wt-1", last_edited=TIMESTAMP_YESTERDAY)

    with pytest.raises(ValidationError) as e:
        WorkflowTemplateModel(**workflow_json)

    assert "last_edited cannot be before date_created" in str(e)


# ### WorkflowInstanceStepModel ###


def test__workflow_instance_step__valid():
    step_json = make_workflow_instance_step(id="s-1", workflow_instance_id="wi-1")
    step_model = WorkflowInstanceStepModel(**step_json)

    assert step_model.id == "s-1"


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
    step_json = make_workflow_instance_step(id="s-1", workflow_instance_id="wi-1")
    step_json.pop(required_field, None)

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceStepModel(**step_json)

    assert "Field required" in str(e)


def test__workflow_instance_step__extra_field():
    step_json = make_workflow_instance_step(id="s-1", workflow_instance_id="wi-1")
    step_json["extra"] = "nope"

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceStepModel(**step_json)

    assert "Extra inputs are not permitted" in (str(e))


@pytest.mark.parametrize(
    "field, value, error_message",
    [
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
    step_json = make_workflow_instance_step(
        id="s-1", workflow_instance_id="wi-1", **{field: value}
    )

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceStepModel(**step_json)

    assert error_message in str(e.value)


def test__workflow_instance_step__invalid_status():
    step_json = make_workflow_instance_step(
        id="s-1", workflow_instance_id="wi-1", status="Done"
    )

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceStepModel(**step_json)

    assert "Input should be" in str(e)


# ### WorkflowInstanceModel ###


def test__workflow_instance__valid():
    workflow_json = make_workflow_instance(id="wi-1")
    workflow_model = WorkflowInstanceModel(**workflow_json)

    assert workflow_model.id == "wi-1"


def test__workflow_instance__with_steps():
    step_1_json = make_workflow_instance_step(id="s-1", workflow_instance_id="wi-1")
    step_2_json = make_workflow_instance_step(id="s-2", workflow_instance_id="wi-1")
    workflow_json = make_workflow_instance(id="wi-1", steps=[step_1_json, step_2_json])

    workflow_model = WorkflowInstanceModel(**workflow_json)

    assert workflow_model.id == "wi-1"
    assert workflow_model.steps[0].id == "s-1"
    assert workflow_model.steps[1].id == "s-2"


def test__workflow_instance__invalid_step():
    step_json = make_workflow_instance_step(id="s-1", workflow_instance_id="wi-1")
    step_json["extra"] = "nope"
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
        "steps",
    ],
)
def test__workflow_instance__missing_required_fields(required_field: str):
    workflow_json = make_workflow_instance(id="s-1")
    workflow_json.pop(required_field)

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceModel(**workflow_json)

    assert "Field required" in str(e)


def test__workflow_instance__extra_field():
    workflow_json = make_workflow_instance(id="wi-1", extra="nope")

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceModel(**workflow_json)

    assert "Extra inputs are not permitted" in (str(e))


@pytest.mark.parametrize(
    "field, value, error_message",
    [
        (
            "completion_date",
            TIMESTAMP_YESTERDAY,
            "completion_date cannot be before start_date",
        ),
    ],
)
def test__workflow_instance__invalid_dates(field: str, value: str, error_message: str):
    workflow_json = make_workflow_instance(id="wi-1", **{field: value})

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceModel(**workflow_json)

    assert error_message in str(e.value)


def test__workflow_instance__invalid_status():
    workflow_json = make_workflow_instance(id="w-1", status="Done")

    with pytest.raises(ValidationError) as e:
        WorkflowInstanceModel(**workflow_json)

    assert "Input should be" in str(e)
