import { axiosFetch } from '../core/http';
import { EndpointEnum } from 'src/shared/enums';
import { ID } from '../../constants';
import { WorkflowTemplateStepBranch } from '../../types/workflow/workflowApiTypes';

//path
const templateStepBranchesPath = (templateId: ID, stepId: ID) =>
  `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}/steps/${stepId}/branches`;

const templateStepBranchPath = (templateId: ID, stepId: ID, branchId: ID) =>
  `${templateStepBranchesPath(templateId, stepId)}/${branchId}`;

// GET /workflow/templates/{templateId}/steps/{stepId}/branches
export const listTemplateStepBranches = async (
  templateId: ID,
  stepId: ID
): Promise<WorkflowTemplateStepBranch[]> => {
  const response = await axiosFetch.get<WorkflowTemplateStepBranch[]>(
    templateStepBranchesPath(templateId, stepId)
  );
  return response.data;
};

// POST /workflow/templates/{templateId}/steps/{stepId}/branches
export const createTemplateStepBranch = async (
  templateId: ID,
  stepId: ID,
  payload: {
    targetStepId: ID;
    condition?: {
      id: ID;
      rule: string;
      data_sources: string[];
    };
  }
): Promise<WorkflowTemplateStepBranch> => {
  const response = await axiosFetch.post<WorkflowTemplateStepBranch>(
    templateStepBranchesPath(templateId, stepId),
    payload
  );
  return response.data;
};

// PUT /workflow/templates/{templateId}/steps/{stepId}/branches/{branchId}
export const updateTemplateStepBranch = async (
  templateId: ID,
  stepId: ID,
  branchId: ID,
  payload: Partial<WorkflowTemplateStepBranch>
): Promise<WorkflowTemplateStepBranch> => {
  const response = await axiosFetch.put<WorkflowTemplateStepBranch>(
    templateStepBranchPath(templateId, stepId, branchId),
    payload
  );
  return response.data;
};

// DELETE /workflow/templates/{templateId}/steps/{stepId}/branches/{branchId}
export const deleteTemplateStepBranch = async (
  templateId: ID,
  stepId: ID,
  branchId: ID
): Promise<void> => {
  await axiosFetch.delete(templateStepBranchPath(templateId, stepId, branchId));
};
