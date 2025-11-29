import { axiosFetch } from '../core/http';
import { CForm } from '../../types/form/formTypes';
import { EndpointEnum } from 'src/shared/enums';
import { PostBody } from 'src/pages/customizedForm/handlers';

export const saveFormResponseAsync = async (
  postBody: PostBody,
  formId?: string
) => {
  return axiosFetch({
    url: EndpointEnum.FORM + (formId ? '/' + formId : ''),
    method: formId ? 'PUT' : 'POST',
    data: formId
      ? {
          questions: postBody.edit,
        }
      : postBody.create,
  });
};
// TODO: here, check contents, verify if questions are being rendered as well
export const getFormResponseAsync = async (formId: string): Promise<CForm> => {
  const response = await axiosFetch.get(EndpointEnum.FORM + `/${formId}`);
  return response.data;
};

export const archiveFormResponseAsync = async (
  formId: string
): Promise<CForm> => {
  const response = await axiosFetch.put(
    EndpointEnum.FORM + `/${formId}/archive`
  );
  return response.data;
};
