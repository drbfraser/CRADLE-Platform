import pytest
from pydantic import ValidationError

from tests.helpers import (
    TIMESTAMP_YESTERDAY,
    make_workflow_template,
    make_workflow_template_step,
)
from validation.workflow_api_models import (
    WorkflowTemplatePatchBody,
)


def test__workflow_template_patch__valid():
    patch_json = make_workflow_template(
        id="wt-1", description={"English": "This is a workflow template for testing."}
    )
    patch_model = WorkflowTemplatePatchBody(**patch_json)

    assert patch_model.id == "wt-1"


def test__workflow_template_patch__with_steps():
    step_json = make_workflow_template_step(
        id="s-1",
        workflow_template_id="wt-1",
        name={"English": "Test Step"},
        description={"English": "This is a workflow template step for testing."},
    )
    patch_json = make_workflow_template(
        id="wt-1",
        description={"English": "This is a workflow template for testing."},
        steps=[step_json],
    )

    patch_model = WorkflowTemplatePatchBody(**patch_json)
    assert patch_model.steps[0].id == "s-1"


def test__workflow_template_patch__without_version():
    patch_json = make_workflow_template(
        id="wt-1", description={"English": "This is a workflow template for testing."}
    )
    del patch_json["version"]

    patch_model = WorkflowTemplatePatchBody(**patch_json)
    assert patch_model.version is None


@pytest.mark.parametrize(
    "field, value, error_message",
    [
        (
            "last_edited",
            TIMESTAMP_YESTERDAY,
            "last_edited cannot be before date_created",
        ),
    ],
)
def test__workflow_template_patch__invalid_dates(
    field: str, value: str, error_message: str
):
    patch_json = make_workflow_template(
        id="wt-1",
        description={"English": "This is a workflow template for testing."},
        **{field: value},
    )

    with pytest.raises(ValidationError) as e:
        WorkflowTemplatePatchBody(**patch_json)

    assert error_message in str(e.value)
