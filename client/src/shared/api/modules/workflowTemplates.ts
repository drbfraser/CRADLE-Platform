import { axiosFetch } from '../core/http';
import { EndpointEnum } from '../../enums';
import { ID } from '../../constants';
import {
  WorkflowTemplate,
  TemplateInput,
  WorkflowTemplateStep,
  TemplateGroupArray,
} from '../../types/workflow/workflowApiTypes';
import {
  WorkflowTemplateMultiLang,
  TemplateMultiLangInput,
} from '../../types/workflow/workflowMultiLangTypes';

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
}): Promise<WorkflowTemplate[]> => {
  const response = await axiosFetch.get<
    WorkflowTemplate[] | TemplateGroupArray | { items: WorkflowTemplate[] }
  >(TEMPLATES, { params });

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

// GET /workflow/templates with archived parameter
export const getAllWorkflowTemplatesAsync = async (
  includeArchived: boolean
): Promise<WorkflowTemplate[]> => {
  try {
    const response = await axiosFetch.get<{ items: WorkflowTemplate[] }>(
      TEMPLATES + `?archived=${includeArchived}`
    );
    return response.data.items;
  } catch (e) {
    console.error(`Error getting all workflow templates: ${e}`);
    throw e;
  }
};

// PATCH /workflow/templates/{templateId}
// Uses the full PATCH endpoint which creates a new version and archives the previous one
// The caller builds the complete multi-lang patch body (see ViewWorkflowTemplate.tsx's
// onSave) - this function just sends it through, since classification.name/description/
// step name+description are now MultiLangText dicts, not plain strings you can .trim().
export const editWorkflowTemplateAsync = async (
  templateId: ID,
  patchBody: Partial<TemplateMultiLangInput>
) => {
  const response = await axiosFetch({
    method: 'PATCH',
    url: `${TEMPLATES}/${templateId}`,
    data: patchBody,
  });

  return response.data;
};

// GET /workflow/templates/{templateId}
export const getTemplate = async (
  templateId: ID,
  params?: {
    with_steps?: boolean;
    with_classification?: boolean;
  }
): Promise<WorkflowTemplate> => {
  const response = await axiosFetch.get<WorkflowTemplate>(
    templatePath(templateId),
    { params }
  );

  return response.data;
};

// POST /workflow/templates/body
export const createTemplate = (payload: TemplateMultiLangInput) =>
  axiosFetch
    .post<WorkflowTemplate>(`${TEMPLATES}/body`, payload)
    .then((r) => r.data);

// PUT /workflow/templates/{templateId}
export const updateTemplate = (templateId: ID, payload: TemplateInput) =>
  axiosFetch
    .put<WorkflowTemplate>(templatePath(templateId), payload)
    .then((r) => r.data);

// GET /workflow/templates/{templateId}/steps
export const listTemplateSteps = async (
  templateId: ID
): Promise<WorkflowTemplateStep[]> => {
  const response = await axiosFetch.get<{ items: WorkflowTemplateStep[] }>(
    templateStepsPath(templateId)
  );
  return response.data.items;
};

// PUT /workflow/templates/{templateId}/steps/{stepId}
export const updateTemplateStep = (
  templateId: ID,
  stepId: ID,
  payload: Partial<WorkflowTemplateStep>
) =>
  axiosFetch
    .put<WorkflowTemplateStep>(
      templateStepByIdPath(templateId, stepId),
      payload
    )
    .then((r) => r.data);

// DELETE /workflow/templates/{templateId}
export const deleteTemplate = (templateId: ID) =>
  axiosFetch.delete(templatePath(templateId));

// These functions are now handled by the main getTemplate function with query parameters
// Kept for backward compatibility
export const getTemplateWithClassification = async (
  templateId: ID
): Promise<WorkflowTemplate> => {
  return getTemplate(templateId, { with_classification: true });
};

export const getTemplateWithSteps = async (
  templateId: ID
): Promise<WorkflowTemplate> => {
  return getTemplate(templateId, { with_steps: true });
};

export const getTemplateWithStepsAndClassification = async (
  templateId: ID
): Promise<WorkflowTemplate> => {
  return getTemplate(templateId, {
    with_steps: true,
    with_classification: true,
  });
};

// GET /workflow/templates/{templateId}/languages
// Mirrors getFormTemplateLangsAsyncV2 in formTemplates.ts
export const getTemplateLangs = async (templateId: ID): Promise<string[]> =>
  (await axiosFetch.get(`${templatePath(templateId)}/languages`)).data
    .langVersions;

// GET /workflow/templates/{templateId}/translations (admin-only)
// Raw multi-language shape for the editor - use this instead of getTemplate
// when entering edit mode, so no existing language's text is silently lost.
export const getTemplateTranslations = async (
  templateId: ID
): Promise<WorkflowTemplateMultiLang> =>
  (
    await axiosFetch.get<WorkflowTemplateMultiLang>(
      `${templatePath(templateId)}/translations`
    )
  ).data;

// Template Step APIs - align with backend workflow_template_steps.py
const TEMPLATE_STEPS = '/workflow/template/steps';

// POST /workflow/template/steps
export const createTemplateStep = (payload: WorkflowTemplateStep) =>
  axiosFetch
    .post<WorkflowTemplateStep>(TEMPLATE_STEPS, payload)
    .then((r) => r.data);

// GET /workflow/template/steps
export const getAllTemplateSteps = async (): Promise<
  WorkflowTemplateStep[]
> => {
  const response = await axiosFetch.get<{ items: WorkflowTemplateStep[] }>(
    TEMPLATE_STEPS
  );
  return response.data.items;
};

// GET /workflow/template/steps/{stepId}
export const getTemplateStepById = async (
  stepId: ID,
  params?: {
    with_form?: boolean;
    with_branches?: boolean;
  }
): Promise<WorkflowTemplateStep> => {
  const response = await axiosFetch.get<WorkflowTemplateStep>(
    `${TEMPLATE_STEPS}/${stepId}`,
    { params }
  );
  return response.data;
};

// GET /workflow/template/steps/{stepId} with query params
export const getTemplateStepWithForm = async (
  stepId: ID
): Promise<WorkflowTemplateStep> => {
  const response = await axiosFetch.get<WorkflowTemplateStep>(
    `${TEMPLATE_STEPS}/${stepId}`,
    { params: { with_form: true } }
  );
  return response.data;
};

// PUT /workflow/template/steps/{stepId}
export const updateTemplateStepById = (
  stepId: ID,
  payload: Partial<WorkflowTemplateStep>
) =>
  axiosFetch
    .put<WorkflowTemplateStep>(`${TEMPLATE_STEPS}/${stepId}`, payload)
    .then((r) => r.data);

// DELETE /workflow/template/steps/{stepId}
export const deleteTemplateStepById = (stepId: ID) =>
  axiosFetch.delete(`${TEMPLATE_STEPS}/${stepId}`);

// Archive a workflow template
export const archiveWorkflowTemplateAsync = async (templateId: string) => {
  await axiosFetch({
    method: 'PUT',
    url:
      EndpointEnum.WORKFLOW_TEMPLATES +
      '/' +
      templateId +
      '/archive?archive=true',
  });
};

// Unarchive a workflow template
export const unarchiveWorkflowTemplateAsync = async (templateId: string) => {
  await axiosFetch({
    method: 'PUT',
    url:
      EndpointEnum.WORKFLOW_TEMPLATES +
      '/' +
      templateId +
      '/archive?archive=false',
  });
};
