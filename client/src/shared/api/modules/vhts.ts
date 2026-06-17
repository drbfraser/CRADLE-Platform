//move all vhts apis to here
import { axiosFetch } from '../core/http';
import { Referrer } from '../../types/referralTypes';
import { EndpointEnum } from 'src/shared/enums';

export const getVHTsAsync = async (): Promise<Referrer[]> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.ALL_VHTS,
  });
  return response.data;
};
