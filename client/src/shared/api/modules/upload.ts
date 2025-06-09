//upload apis 
import { axiosFetch } from "../core/http";
import { EndpointEnum } from 'src/shared/enums'

export const uploadAppFileAsync = async (file: File) => {
  return axiosFetch.postForm(EndpointEnum.UPLOAD_ADMIN, {
    file: file,
  });
};

export const getAppFileAsync = async () => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.UPLOAD_ADMIN + '?' + Date.now(),
    responseType: 'blob',
  });
  return response.data;
};

export const getAppFileHeadAsync = async () => {
  const response = await axiosFetch({
    method: 'HEAD',
    url: EndpointEnum.UPLOAD_ADMIN + '?' + Date.now(),
    responseType: 'blob',
  });
  return response.data;
};