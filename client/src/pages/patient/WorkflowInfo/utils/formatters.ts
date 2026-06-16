import { StepStatus } from 'src/shared/types/workflow/workflowEnums';
import { InstanceStep } from 'src/shared/types/workflow/workflowUiTypes';
import { getDateFromStringTimestamp } from 'src/shared/utils';

export const formatWorkflowStepStatusText = (s: InstanceStep) => {
  if (s.status === StepStatus.COMPLETED && s.completedOn) {
    return `Status: Completed, Completed on: ${getDateFromStringTimestamp(
      s.completedOn
    )}`;
  }
  if (s.status === StepStatus.ACTIVE) {
    return `Status: In Progress${
      s.startedOn
        ? `, Started on: ${getDateFromStringTimestamp(s.startedOn)}`
        : ''
    }`;
  }
  return 'Status: Possible future step';
};
