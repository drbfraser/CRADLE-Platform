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
    A read-only view over a workflow instance and its template that provides
    convenient access to workflow steps.

    Should be stable because:
        - It holds references to the workflow models, so changes to state made
          externally are reflected automatically
        - Step ID mappings should be fixed for a given template-instance pair
    """

    def __init__(
        self, template: WorkflowTemplateModel, instance: WorkflowInstanceModel
    ):
        assert template.id == instance.workflow_template_id

        self.template = template
        self.instance = instance

        self._instance_steps_by_id = {step.id: step for step in instance.steps}
        self._template_steps_by_id = {step.id: step for step in template.steps}
        self._template_step_id_to_instance_step_id = {
            step.workflow_template_step_id: step.id for step in instance.steps
        }

    def get_instance_step(self, step_id: str) -> WorkflowInstanceStepModel:
        assert step_id in self._instance_steps_by_id
        return self._instance_steps_by_id[step_id]

    def has_instance_step(self, step_id: str) -> bool:
        return step_id in self._instance_steps_by_id

    def get_template_step(self, step_id: str) -> WorkflowTemplateStepModel:
        assert step_id in self._template_steps_by_id
        return self._template_steps_by_id[step_id]

    def get_template_step_branch(
        self, step: WorkflowTemplateStepModel, branch_id: str
    ) -> WorkflowTemplateStepBranchModel:
        for branch in step.branches:
            if branch.id == branch_id:
                return branch
        raise ValueError(f"Template step has no branch with ID '{branch_id}'")

    def get_instance_step_for_template_step(
        self, template_step_id: str
    ) -> WorkflowInstanceStepModel:
        return self.get_instance_step(
            self._template_step_id_to_instance_step_id[template_step_id]
        )

    def get_starting_step(self) -> WorkflowInstanceStepModel:
        template_step = self._template_steps_by_id[self.template.starting_step_id]
        return self.get_instance_step_for_template_step(template_step.id)

    def get_current_step(self) -> Optional[WorkflowInstanceStepModel]:
        if self.instance.current_step_id:
            return self.get_instance_step(self.instance.current_step_id)
        return None
