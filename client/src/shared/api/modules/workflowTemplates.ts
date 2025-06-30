import { axiosFetch } from '../core/http';
import { EndpointEnum } from '../../enums';
import { ID } from '../../constants';
import {
  WorkflowTemplate,
  TemplateInput,
  TemplateStep,
  TemplateGroupArray,
} from '../../types/workflow/workflowTypes';

// full base path
const TEMPLATES = EndpointEnum.WORKFLOW_TEMPLATES;

// which specific template
const templatePath = (id: ID) => `${TEMPLATES}/${id}`;

// steps for that template
const templateStepsPath = (id: ID) => `${templatePath(id)}/steps`;

// a specific step within a template
const templateStepByIdPath = (templateId: ID, stepId: ID) =>
  `${templateStepsPath(templateId)}/${stepId}`;

// Workflow Template API Methods

// GET /workflow/templates
export const listTemplates = async (params?: {
  groupBy?: 'classification';
  classificationId?: ID;
  archived?: boolean;
}): Promise<WorkflowTemplate[] | TemplateGroupArray> => {
  const response = await axiosFetch.get<
    WorkflowTemplate[] | TemplateGroupArray
  >(TEMPLATES, { params });
  return response.data;
};

// GET /workflow/templates/{templateId}
export const getTemplate = async (
  templateId: ID
): Promise<WorkflowTemplate> => {
  const response = await axiosFetch.get<WorkflowTemplate>(
    templatePath(templateId)
  );
  return response.data;
};

// POST /workflow/templates
export const createTemplate = (payload: TemplateInput) =>
  axiosFetch.post<WorkflowTemplate>(TEMPLATES, payload).then((r) => r.data);

// PUT /workflow/templates/{templateId}
export const updateTemplate = (templateId: ID, payload: TemplateInput) =>
  axiosFetch
    .put<WorkflowTemplate>(templatePath(templateId), payload)
    .then((r) => r.data);

// PUT /workflow/templates/{templateId} (archive/unarchive)
export const toggleArchiveTemplate = (templateId: ID, archived: boolean) =>
  axiosFetch
    .put<WorkflowTemplate>(templatePath(templateId), { archived })
    .then((r) => r.data);

// GET /workflow/templates/{templateId}/steps
export const listTemplateSteps = async (
  templateId: ID
): Promise<TemplateStep[]> => {
  const response = await axiosFetch.get<TemplateStep[]>(
    templateStepsPath(templateId)
  );
  return response.data;
};

// PUT /workflow/templates/{templateId}/steps/{stepId}
export const updateTemplateStep = (
  templateId: ID,
  stepId: ID,
  payload: Partial<TemplateStep>
) =>
  axiosFetch
    .put<TemplateStep>(templateStepByIdPath(templateId, stepId), payload)
    .then((r) => r.data);
