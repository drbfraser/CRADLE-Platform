import { axiosFetch } from '../core/http';
import { EndpointEnum } from 'src/shared/enums';
import { ID } from '../../constants';
import { TemplateStepBranch } from '../../types/workflow/workflowTypes';

//path
const templateStepBranchesPath = (templateId: ID, stepId: ID) =>
  `${EndpointEnum.WORKFLOW_TEMPLATES}/${templateId}/steps/${stepId}/branches`;

const templateStepBranchPath = (templateId: ID, stepId: ID, branchId: ID) =>
  `${templateStepBranchesPath(templateId, stepId)}/${branchId}`;

// GET /workflow/templates/{templateId}/steps/{stepId}/branches
export const listTemplateStepBranches = async (
  templateId: ID,
  stepId: ID
): Promise<TemplateStepBranch[]> => {
  const response = await axiosFetch.get<TemplateStepBranch[]>(
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
      logic: 'AND' | 'OR' | 'NOT';
      rules: string;
    };
  }
): Promise<TemplateStepBranch> => {
  const response = await axiosFetch.post<TemplateStepBranch>(
    templateStepBranchesPath(templateId, stepId),
    payload
  );
  return response.data;
};

// PUT /workflow/templates/{templateId}/steps/{stepId}/branches/{branchId}
// PUT /workflow/templates/{templateId}/steps/{stepId}/branches/{branchId}
export const updateTemplateStepBranch = async (
  templateId: ID,
  stepId: ID,
  branchId: ID,
  payload: Partial<TemplateStepBranch>
): Promise<TemplateStepBranch> => {
  const response = await axiosFetch.put<TemplateStepBranch>(
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
