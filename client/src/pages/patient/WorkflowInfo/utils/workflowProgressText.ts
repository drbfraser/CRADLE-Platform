import { InstanceStatus } from 'src/shared/types/workflow/workflowEnums';
import {
  InstanceDetails,
  WorkflowInstanceProgress,
} from 'src/shared/types/workflow/workflowUiTypes';
import { getWorkflowShortestPath } from './progress';

export function isWorkflowInstanceCompleted(
  instance: InstanceDetails
): boolean {
  return instance.status === InstanceStatus.COMPLETED;
}

export function getWorkflowRemainingStepsCount(
  workflowInstance: InstanceDetails,
  progressInfo: WorkflowInstanceProgress,
  shortestPath = getWorkflowShortestPath(workflowInstance)
): number {
  return shortestPath || workflowInstance.steps.length - progressInfo.completed;
}

export function formatWorkflowProgressValue(
  workflowInstance: InstanceDetails,
  progressInfo: WorkflowInstanceProgress,
  shortestPath = getWorkflowShortestPath(workflowInstance)
): string {
  const isCompleted = isWorkflowInstanceCompleted(workflowInstance);
  const denominator = isCompleted
    ? progressInfo.completed
    : progressInfo.completed + (shortestPath || 0);
  const suffix = isCompleted ? '' : '+';

  return `${progressInfo.completed} / ${denominator}${suffix}`;
}

export function formatWorkflowRemainingStepsText(
  workflowInstance: InstanceDetails,
  progressInfo: WorkflowInstanceProgress,
  shortestPath = getWorkflowShortestPath(workflowInstance)
): string {
  if (isWorkflowInstanceCompleted(workflowInstance)) {
    return 'All steps completed';
  }

  const remainingSteps = getWorkflowRemainingStepsCount(
    workflowInstance,
    progressInfo,
    shortestPath
  );

  return `At least ${remainingSteps} more step${
    remainingSteps !== 1 ? 's' : ''
  } remaining`;
}
