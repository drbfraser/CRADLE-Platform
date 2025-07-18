import { axiosFetch } from '../core/http';
import { EndpointEnum } from '../../enums';
import { ID } from '../../constants';
import {
  WorkflowTemplate,
  TemplateInput,
  TemplateStep,
  TemplateGroupArray,
  WorkflowClassification,
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

// classification base path
const CLASSIFICATIONS = EndpointEnum.WORKFLOW_CLASSIFICATIONS;

// GET /workflow/classifications ???
export const listWorkflowClassifications = async (): Promise<
  WorkflowClassification[]
> => {
  const response = await axiosFetch.get<WorkflowClassification[]>(
    CLASSIFICATIONS
  );
  return response.data;
};

// Workflow Template API Methods

// GET /workflow/templates
export const listTemplates = async (parameters?: {
  groupBy?: 'classification';
  classificationId?: ID;
  archived?: boolean;
}): Promise<WorkflowTemplate[]> => {
   const params = {
    classification_id: parameters?.classificationId,
    is_archived: parameters?.archived
  };
  console.log(params);
  const response = await axiosFetch.get<
    WorkflowTemplate[] | TemplateGroupArray | { items: WorkflowTemplate[] }
  >(TEMPLATES, { params });
  console.log(response.data);

  // Handle different response formats
  if (Array.isArray(response.data)) {
    return response.data as WorkflowTemplate[];
  }
  if (
    response.data &&
    typeof response.data === 'object' &&
    'items' in response.data
  ) {
    return (response.data as { items: WorkflowTemplate[] }).items;
  }
  return [] as WorkflowTemplate[];
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

// DELETE /workflow/templates/{templateId}
export const deleteTemplate = (templateId: ID) =>
  axiosFetch.delete(templatePath(templateId));

// GET /workflow/templates/{templateId}/with-classification
export const getTemplateWithClassification = async (
  templateId: ID
): Promise<WorkflowTemplate> => {
  const response = await axiosFetch.get<WorkflowTemplate>(
    `${templatePath(templateId)}/with-classification`
  );
  return response.data;
};

// GET /workflow/templates/{templateId}/with-steps
export const getTemplateWithSteps = async (
  templateId: ID
): Promise<WorkflowTemplate> => {
  const response = await axiosFetch.get<WorkflowTemplate>(
    `${templatePath(templateId)}/with-steps`
  );
  return response.data;
};

// GET /workflow/templates/{templateId}/with-steps-and-classification
export const getTemplateWithStepsAndClassification = async (
  templateId: ID
): Promise<WorkflowTemplate> => {
  const response = await axiosFetch.get<WorkflowTemplate>(
    `${templatePath(templateId)}/with-steps-and-classification`
  );
  return response.data;
};

// Template Step APIs - align with backend workflow_template_steps.py
const TEMPLATE_STEPS = '/workflow/template/steps';

// POST /workflow/template/steps
export const createTemplateStep = (payload: TemplateStep) =>
  axiosFetch.post<TemplateStep>(TEMPLATE_STEPS, payload).then((r) => r.data);

// GET /workflow/template/steps
export const getAllTemplateSteps = async (): Promise<TemplateStep[]> => {
  const response = await axiosFetch.get<{ items: TemplateStep[] }>(
    TEMPLATE_STEPS
  );
  return response.data.items;
};

// GET /workflow/template/steps/{stepId}
export const getTemplateStepById = async (
  stepId: ID
): Promise<TemplateStep> => {
  const response = await axiosFetch.get<TemplateStep>(
    `${TEMPLATE_STEPS}/${stepId}`
  );
  return response.data;
};

// GET /workflow/template/steps/{stepId}/with-form
export const getTemplateStepWithForm = async (
  stepId: ID
): Promise<TemplateStep> => {
  const response = await axiosFetch.get<TemplateStep>(
    `${TEMPLATE_STEPS}/${stepId}/with-form`
  );
  return response.data;
};

// GET /workflow/template/steps/by-template/{templateId}
export const getTemplateStepsByTemplate = async (
  templateId: ID
): Promise<TemplateStep[]> => {
  const response = await axiosFetch.get<{ items: TemplateStep[] }>(
    `${TEMPLATE_STEPS}/by-template/${templateId}`
  );
  return response.data.items;
};

// PUT /workflow/template/steps/{stepId}
export const updateTemplateStepById = (
  stepId: ID,
  payload: Partial<TemplateStep>
) =>
  axiosFetch
    .put<TemplateStep>(`${TEMPLATE_STEPS}/${stepId}`, payload)
    .then((r) => r.data);

// DELETE /workflow/template/steps/{stepId}
export const deleteTemplateStepById = (stepId: ID) =>
  axiosFetch.delete(`${TEMPLATE_STEPS}/${stepId}`);
