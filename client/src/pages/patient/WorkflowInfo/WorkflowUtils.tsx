import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import { InstanceStep } from 'src/shared/types/workflow/workflowUiTypes';

export const formatWorkflowStepStatusText = (s: InstanceStep) => {
  if (s.status === StepStatus.COMPLETED && s.completedOn) {
    return `Status: Completed, Completed on: ${s.completedOn}`;
  }
  if (s.status === StepStatus.ACTIVE) {
    return `Status: In Progress${
      s.startedOn ? `, Started on: ${s.startedOn}` : ''
    }`;
  }
  return 'Status: Pending';
};
