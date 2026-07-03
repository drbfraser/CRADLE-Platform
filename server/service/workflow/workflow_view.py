from typing import Optional

from validation.workflow_models import (
    WorkflowInstanceModel,
    WorkflowInstanceStepModel,
    WorkflowTemplateModel,
    WorkflowTemplateStepBranchModel,
    WorkflowTemplateStepModel,
)


class WorkflowView:
    """
    A view over a workflow instance and its template that provides
    convenient access to workflow steps.

    Holds references to the workflow models so changes to state made
    externally are reflected automatically. Steps are created on demand
    as the workflow advances.
    """

    def __init__(
        self, template: WorkflowTemplateModel, instance: WorkflowInstanceModel
    ):
        """Initialize the view by indexing instance and template steps by ID for fast lookup."""
        assert template.id == instance.workflow_template_id

        self.template = template
        self.instance = instance

        self._instance_steps_by_id = {step.id: step for step in instance.steps}
        self._template_steps_by_id = {step.id: step for step in template.steps}
        self._template_step_id_to_instance_step_id = {
            step.workflow_template_step_id: step.id for step in instance.steps
        }

    def get_instance_step(self, step_id: str) -> WorkflowInstanceStepModel:
        """Return the instance step with the given ID, asserting it exists."""
        assert step_id in self._instance_steps_by_id
        return self._instance_steps_by_id[step_id]

    def has_instance_step(self, step_id: str) -> bool:
        """Return True if an instance step with the given ID exists."""
        return step_id in self._instance_steps_by_id

    def get_template_step(self, step_id: str) -> WorkflowTemplateStepModel:
        """Return the template step with the given ID, asserting it exists."""
        assert step_id in self._template_steps_by_id
        return self._template_steps_by_id[step_id]

    def get_template_step_branch(
        self, step: WorkflowTemplateStepModel, branch_id: str
    ) -> WorkflowTemplateStepBranchModel:
        """Return the branch with the given ID from a template step, raising ValueError if not found."""
        for branch in step.branches:
            if branch.id == branch_id:
                return branch
        raise ValueError(f"Template step has no branch with ID '{branch_id}'")

    def get_instance_step_for_template_step(
        self, template_step_id: str
    ) -> WorkflowInstanceStepModel:
        """Return the instance step that corresponds to the given template step ID."""
        return self.get_instance_step(
            self._template_step_id_to_instance_step_id[template_step_id]
        )

    def get_or_create_instance_step_for_template_step(
        self, template_step_id: str
    ) -> WorkflowInstanceStepModel:
        """Return the instance step for the given template step, creating it if it does not exist yet."""
        if template_step_id not in self._template_step_id_to_instance_step_id:
            from service.workflow.workflow_service import WorkflowService

            template_step = self.get_template_step(template_step_id)
            new_step = WorkflowService.generate_workflow_instance_step(
                template_step, self.instance.id
            )
            self.instance.steps.append(new_step)
            self._instance_steps_by_id[new_step.id] = new_step
            self._template_step_id_to_instance_step_id[template_step_id] = new_step.id
        return self.get_instance_step_for_template_step(template_step_id)

    def get_starting_step(self) -> WorkflowInstanceStepModel:
        """Return the instance step corresponding to the template's starting step."""
        template_step = self._template_steps_by_id[self.template.starting_step_id]
        return self.get_or_create_instance_step_for_template_step(template_step.id)

    def get_current_step(self) -> Optional[WorkflowInstanceStepModel]:
        """Return the current instance step, or None if the workflow has not started."""
        if self.instance.current_step_id:
            return self.get_instance_step(self.instance.current_step_id)
        return None
