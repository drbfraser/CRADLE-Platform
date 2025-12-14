//move all formTemplates apis to here
import { axiosFetch } from '../core/http';
import {
  FormTemplate,
  FormTemplates,
  FormTemplateWithQuestions,
  FormTemplateWithQuestionsV2,
} from '../../types/form/formTemplateTypes';
import { EndpointEnum } from 'src/shared/enums';

// TODO: delete this one once forms v2 have been integrated
export const editFormTemplateAsync = async (template: FormTemplate) =>
  axiosFetch({
    method: 'PUT',
    url: `${EndpointEnum.FORM_TEMPLATES}/${template.id}?archived=${template.archived}`,
    data: template,
  });

export const editFormTemplateAsyncV2 = async (template: FormTemplate) =>
  axiosFetch({
    method: 'PUT',
    url: `${EndpointEnum.FORM_TEMPLATES_V2}/${template.id}?archived=${template.archived}`,
    data: template,
  });

export const saveFormTemplateWithFileAsync = async (file: File) => {
  // Axios will automatically serialize the object into proper form format.

  return axiosFetch.postForm(EndpointEnum.FORM_TEMPLATES, {
    file: file,
  });
};

// TODO: delete this one once forms v2 have been integrated
export const saveFormTemplateAsync = async (
  formTemplate: FormTemplateWithQuestions
) => {
  // Sends FormTemplate to server via request body rather than as a file.
  return axiosFetch({
    method: 'POST',
    url: `${EndpointEnum.FORM_TEMPLATES}/body`,
    data: formTemplate,
  });
};

export const saveFormTemplateAsyncV2 = async (
  formTemplate: FormTemplateWithQuestionsV2
) => {
  // Sends FormTemplate to server via request body rather than as a file.
  return axiosFetch({
    method: 'POST',
    url: `${EndpointEnum.FORM_TEMPLATES_V2}/body`,
    data: formTemplate,
  });
};

// TODO: delete this one once the new forms have been integrated in workflows
export const getFormClassificationTemplates = async (
  formClassificationId: string
): Promise<FormTemplateWithQuestions[]> => {
  const response = await axiosFetch.get(
    `${EndpointEnum.FORM_CLASSIFICATIONS}/${formClassificationId}/templates`
  );
  return response.data;
};

export const getFormClassificationTemplatesV2 = async (
  formClassificationId: string
): Promise<FormTemplateWithQuestions[]> => {
  const response = await axiosFetch.get(
    `${EndpointEnum.FORM_CLASSIFICATIONS_V2}/${formClassificationId}/templates`
  );
  return response.data;
};

// TODO: delete this one once the new forms have been integrated in workflows
export const getAllFormTemplatesAsync = async (
  includeArchived: boolean
): Promise<FormTemplate[]> => {
  try {
    const response = await axiosFetch.get(
      EndpointEnum.FORM_TEMPLATES + `?include_archived=${includeArchived}`
    );
    return response.data;
  } catch (e) {
    console.error(`Error getting all form templates: ${e}`);
    throw e;
  }
};

export const getAllFormTemplatesAsyncV2 = async (
  includeArchived: boolean
): Promise<FormTemplates> => {
  try {
    const response = await axiosFetch.get(
      EndpointEnum.FORM_TEMPLATES_V2 + `?include_archived=${includeArchived}`
    );
    return response.data;
  } catch (e) {
    console.error(`Error getting all form templates: ${e}`);
    throw e;
  }
};

// TODO: delete this when forms v2 are integrated
export const getFormTemplateAsync = async (
  formTemplateId: string
): Promise<FormTemplateWithQuestions> => {
  const response = await axiosFetch.get(
    `${EndpointEnum.FORM_TEMPLATES}/${formTemplateId}`
  );
  return response.data;
};

export const getFormTemplateAsyncV2 = async (
  formTemplateId: string
): Promise<FormTemplateWithQuestionsV2> => {
  const response = await axiosFetch.get(
    `${EndpointEnum.FORM_TEMPLATES_V2}/${formTemplateId}`
  );
  return response.data;
};

export const getFormTemplateLangAsync = async (
  formTemplateId: string,
  lang: string
) =>
  (
    await axiosFetch.get(
      `${EndpointEnum.FORM_TEMPLATES}/${formTemplateId}?lang=${lang}`
    )
  ).data;

export const getFormTemplateLangsAsync = async (
  formTemplateId: string
): Promise<string[]> =>
  (
    await axiosFetch.get(
      EndpointEnum.FORM_TEMPLATES + `/${formTemplateId}/versions`
    )
  ).data.langVersions;

// TODO: delete this when forms v2 are integrated
export const getFormTemplateCsvAsync = async (
  formTemplateId: string,
  version: string
) => {
  try {
    const response = await axiosFetch({
      url:
        EndpointEnum.FORM_TEMPLATES +
        `/${formTemplateId}/versions/${version}/csv`,
      responseType: 'blob',
    });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getFormTemplateCsvAsyncV2 = async (
  formTemplateId: string,
  version: string
) => {
  try {
    const response = await axiosFetch({
      url:
        EndpointEnum.FORM_TEMPLATES_V2 +
        `/${formTemplateId}/versions/${version}/csv`,
      responseType: 'blob',
    });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
