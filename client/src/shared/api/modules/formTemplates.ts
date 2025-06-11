//move all formTemplates apis to here
import { axiosFetch } from '../core/http';
import { FormTemplate, FormTemplateWithQuestions } from '../../types';
import { EndpointEnum } from 'src/shared/enums';

export const editFormTemplateAsync = async (template: FormTemplate) =>
  axiosFetch({
    method: 'PUT',
    url: EndpointEnum.FORM_TEMPLATES + '/' + template.id,
    data: template,
  });

export const saveFormTemplateWithFileAsync = async (file: File) => {
  // Axios will automatically serialize the object into proper form format.

  return axiosFetch.postForm(EndpointEnum.FORM_TEMPLATES, {
    file: file,
  });
};

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

export const getFormClassificationTemplates = async (
  formClassificationId: string
): Promise<FormTemplateWithQuestions[]> => {
  const response = await axiosFetch.get(
    `${EndpointEnum.FORM_CLASSIFICATIONS}/${formClassificationId}/templates`
  );
  return response.data;
};

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

export const getFormTemplateAsync = async (
  formTemplateId: string
): Promise<FormTemplateWithQuestions> => {
  const response = await axiosFetch.get(
    `${EndpointEnum.FORM_TEMPLATES}/blank/${formTemplateId}`
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
