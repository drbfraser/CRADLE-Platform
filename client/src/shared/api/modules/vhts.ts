//move all vhts apis to here 
import { axiosFetch } from '../core/http';
import {
  VHT,
  Referrer,
} from '../../types'
import { EndpointEnum } from 'src/shared/enums';

export const getUserVhtsAsync = async (): Promise<Referrer[]> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.USER_VHTS,
  });
  return response.data;
};

export const getVHTsAsync = async (): Promise<VHT[]> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.ALL_VHTS,
  });
  return response.data;
};