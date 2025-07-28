import { axiosFetch } from '../core/http';
import { EndpointEnum } from 'src/shared/enums';
import { ID } from '../../constants';
import {
  WorkflowInstance,
  InstanceStep,
  TemplateStepBranch,
  InstanceInput,
} from '../../types/workflow/workflowTypes';

// Add this to your EndpointEnum: WORKFLOW_EXECUTION = '/workflow/execution'
const WORKFLOW_EXECUTION = EndpointEnum.WORKFLOW_EXECUTION;

// POST /workflow/execution/start - Start new workflow instance
export const startWorkflowInstanceAsync = async (
  payload: InstanceInput & {
    startedBy: ID;
    initialData?: Record<string, unknown>;
  }
): Promise<WorkflowInstance> => {
  const response = await axiosFetch.post<WorkflowInstance>(
    `${WORKFLOW_EXECUTION}/start`,
    payload
  );
  return response.data;
};

// POST /workflow/execution/complete-step - Complete workflow step
export const completeWorkflowStepAsync = async (payload: {
  instanceId: ID;
  stepId: ID;
  completedBy: ID;
  formId?: ID; // Link to your existing form response
  data?: Record<string, unknown>;
}): Promise<{
  instance: WorkflowInstance;
  nextStep?: InstanceStep;
  activatedBranches?: TemplateStepBranch[];
}> => {
  const response = await axiosFetch.post(
    `${WORKFLOW_EXECUTION}/complete-step`,
    payload
  );
  return response.data;
};

// POST /workflow/execution/skip-step - Skip workflow step
export const skipWorkflowStepAsync = async (payload: {
  instanceId: ID;
  stepId: ID;
  skippedBy: ID;
  reason: string;
}): Promise<{
  instance: WorkflowInstance;
  nextStep?: InstanceStep;
}> => {
  const response = await axiosFetch.post(
    `${WORKFLOW_EXECUTION}/skip-step`,
    payload
  );
  return response.data;
};

// POST /workflow/execution/assign-step - Assign step to user
export const assignWorkflowStepAsync = async (payload: {
  instanceId: ID;
  stepId: ID;
  assignedTo: ID;
  assignedBy: ID;
  note?: string;
}): Promise<InstanceStep> => {
  const response = await axiosFetch.post<InstanceStep>(
    `${WORKFLOW_EXECUTION}/assign-step`,
    payload
  );
  return response.data;
};

// GET /workflow/execution/next-steps/{instanceId} - Get possible next steps
export const getNextWorkflowStepsAsync = async (
  instanceId: ID
): Promise<{
  currentStep?: InstanceStep;
  possibleNextSteps: InstanceStep[];
  requiresDecision: boolean;
}> => {
  const response = await axiosFetch.get(
    `${WORKFLOW_EXECUTION}/next-steps/${instanceId}`
  );
  return response.data;
};

// POST /workflow/execution/evaluate-conditions - Test workflow conditions
export const evaluateWorkflowConditionsAsync = async (payload: {
  instanceId: ID;
  stepId: ID;
  formData: Record<string, unknown>;
}): Promise<{
  nextSteps: ID[];
  branchResults: {
    branchId: ID;
    condition: boolean;
    targetStepId: ID;
  }[];
}> => {
  const response = await axiosFetch.post(
    `${WORKFLOW_EXECUTION}/evaluate-conditions`,
    payload
  );
  return response.data;
};
