from tests.helpers import (
    make_workflow_template,
    make_workflow_template_step,
)
from validation.workflow_api_models import (
    WorkflowTemplatePatchBody,
)


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
