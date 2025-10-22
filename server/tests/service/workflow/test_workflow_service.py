from service.workflow.workflow_service import WorkflowService
from tests.helpers import get_uuid, make_workflow_template, make_workflow_template_step
from validation.workflow_models import WorkflowTemplateModel


def test_workflow_service__generate_workflow_instance():
    workflow_template_id = get_uuid()

    step_templates = [
        make_workflow_template_step(
            name="Step 1", workflow_template_id=workflow_template_id
        ),
        make_workflow_template_step(
            name="Step 2", workflow_template_id=workflow_template_id
        ),
    ]

    workflow_template_dict = make_workflow_template(
        id=workflow_template_id, steps=step_templates
    )

    workflow_template = WorkflowTemplateModel(**workflow_template_dict)

    workflow_instance = WorkflowService.generate_workflow_instance(workflow_template)

    assert workflow_instance.id is not None
    assert workflow_instance.name == workflow_template_dict["name"]
    assert workflow_instance.description == workflow_template_dict["description"]
    assert workflow_instance.status == "Pending"
    assert workflow_instance.workflow_template_id == workflow_template_dict["id"]
    assert workflow_instance.start_date is None
    assert workflow_instance.current_step_id is None
    assert workflow_instance.last_edited is None
    assert workflow_instance.completion_date is None
    assert workflow_instance.patient_id is None

    assert len(workflow_instance.steps) == 2

    actual_step_names = {step.name for step in workflow_instance.steps}
    expected_step_names = {"Step 1", "Step 2"}
    assert actual_step_names == expected_step_names

    for step_instance in workflow_instance.steps:
        assert step_instance.id is not None
        assert step_instance.workflow_instance_id == workflow_instance.id
        assert step_instance.description is not None  # Leniant check for convenience
        assert step_instance.status == "Pending"
        assert step_instance.start_date is None
        assert step_instance.last_edited is None
        assert step_instance.completion_date is None
        assert step_instance.expected_completion is None
        assert step_instance.data is None
        assert step_instance.triggered_by is None
        assert step_instance.form_id is None
        assert step_instance.form is None
