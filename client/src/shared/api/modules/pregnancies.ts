import { axiosFetch } from '../core/http';
import {
  Pregnancy,
} from '../../types'
import { EndpointEnum } from 'src/shared/enums';

export const getPregnancyAsync = async (
  pregnancyId: string
): Promise<Pregnancy> => {
  const response = await axiosFetch.get(
    EndpointEnum.PREGNANCIES + `/${pregnancyId}`
  );
  return response.data;
};

export const deletePregnancyAsync = async (pregnancy: Pregnancy) =>
  axiosFetch({
    url: EndpointEnum.PREGNANCIES + `/${pregnancy.id}`,
    method: 'DELETE',
  });