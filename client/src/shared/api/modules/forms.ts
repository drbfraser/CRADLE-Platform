import { axiosFetch } from '../core/http';
import {
  CForm
} from '../../types'
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

export const getFormResponseAsync = async (formId: string): Promise<CForm> => {
  const response = await axiosFetch.get(EndpointEnum.FORM + `/${formId}`);
  return response.data;
};