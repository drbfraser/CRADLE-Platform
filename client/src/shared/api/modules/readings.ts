import { axiosFetch } from '../core/http'
import { EndpointEnum } from 'src/shared/enums'


export const saveReadingAsync = async (reading: any) => {
  const response = await axiosFetch({
    url: EndpointEnum.READINGS,
    method: 'POST',
    data: reading,
  });
  return response.data;
};