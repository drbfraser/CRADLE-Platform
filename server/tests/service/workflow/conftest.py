import pytest
import sys
import os

from service.workflow.workflow_service import WorkflowService
from service.workflow.workflow_view import WorkflowView
from tests import helpers
from validation.workflow_models import WorkflowInstanceModel, WorkflowTemplateModel

current_dir = os.path.dirname(os.path.abspath(__file__))
server_root = os.path.abspath(os.path.join(current_dir, '..', '..', '..'))
sys.path.insert(0, server_root)

@pytest.fixture(scope='session')
def app():
    import config
    return config.app


@pytest.fixture(scope='function')
def app_context(app):
    with app.app_context():
        yield app


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
                id="b-1", step_id=step_template_1_id, target_step_id=step_template_2_id
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