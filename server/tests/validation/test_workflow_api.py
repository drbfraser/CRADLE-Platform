import pytest

from pydantic import ValidationError

from validation.workflow_api import (
    WorkflowInstancePatchModel,
    WorkflowTemplatePatchBody,
)

from tests.validation.test_workflow_objects import (
    classification,
    form,
    template_form,
    workflow_template_step_factory,
    workflow_instance_step_factory,
)


############################################################################
#                                 Fixtures                                 #
############################################################################


@pytest.fixture
def workflow_template_patch_factory(classification):
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
def workflow_instance_patch_factory():
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


############################################################################
#                       Test WorkflowTemplatePatchBody                     #
############################################################################


def test__workflow_template_patch__valid(workflow_template_patch_factory):
    patch_json = workflow_template_patch_factory()
    patch_model = WorkflowTemplatePatchBody(**patch_json)
    # sanity check
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
def test__workflow_template_patch__optional_fields_missing(
    workflow_template_patch_factory, optional_field: str
):
    patch_json = workflow_template_patch_factory()
    del patch_json[optional_field]

    WorkflowTemplatePatchBody(**patch_json)


def test__workflow_template_patch__with_steps(
    workflow_template_patch_factory, workflow_template_step_factory
):
    step_json = workflow_template_step_factory()
    patch_json = workflow_template_patch_factory(steps=[step_json])

    patch_model = WorkflowTemplatePatchBody(**patch_json)
    assert patch_model.steps[0].id == "workflow-template-step-1"


@pytest.mark.parametrize(
    "field, value, error_message",
    [
        ("last_edited", "1759243725", "last_edited cannot be before date_created"),
    ],
)
def test__workflow_template_patch__invalid_dates(
    workflow_template_patch_factory, field: str, value: str, error_message: str
):
    patch_json = workflow_template_patch_factory(**{field: value})

    with pytest.raises(ValidationError) as e:
        WorkflowTemplatePatchBody(**patch_json)

    assert error_message in str(e.value)


############################################################################
#                       Test WorkflowInstancePatchModel                    #
############################################################################


def test__workflow_instance_patch__valid(workflow_instance_patch_factory):
    patch_json = workflow_instance_patch_factory()
    patch_model = WorkflowInstancePatchModel(**patch_json)
    # sanity check
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
def test__workflow_instance_patch__optional_fields_missing(
    workflow_instance_patch_factory, optional_field: str
):
    patch_json = workflow_instance_patch_factory()
    del patch_json[optional_field]

    WorkflowInstancePatchModel(**patch_json)


def test__workflow_instance_patch__with_steps(
    workflow_instance_patch_factory, workflow_instance_step_factory
):
    step_json = workflow_instance_step_factory()
    patch_json = workflow_instance_patch_factory(steps=[step_json])

    patch_model = WorkflowInstancePatchModel(**patch_json)
    assert patch_model.steps[0].id == "workflow-instance-step-1"


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
def test__workflow_instance_patch__invalid_dates(
    workflow_instance_patch_factory, field: str, value: str, error_message: str
):
    patch_json = workflow_instance_patch_factory(**{field: value})

    with pytest.raises(ValidationError) as e:
        WorkflowInstancePatchModel(**patch_json)

    assert error_message in str(e.value)
