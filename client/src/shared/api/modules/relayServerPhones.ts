import { axiosFetch } from '../core/http'
import {
  RelayNum,
} from '../../types'
import { EndpointEnum, MethodEnum } from 'src/shared/enums'

export const addRelayServerPhone = async (
  phoneNumber: string,
  description: string
) => {
  const response = await axiosFetch({
    url: EndpointEnum.RELAY_SERVER_PHONE,
    method: MethodEnum.POST,
    data: {
      phoneNumber,
      description,
    },
  });
  return response.data;
};

export const getRelayServerPhones = async (): Promise<RelayNum[]> =>
  (await axiosFetch.get(EndpointEnum.RELAY_SERVER_PHONE)).data;

export const saveRelayNumAsync = async (relayNum: RelayNum) => {
  axiosFetch({
    url: EndpointEnum.RELAY_SERVER_PHONE,
    method: MethodEnum.PUT,
    data: relayNum,
  });
};

export const deleteRelayNumAsync = async (relayNum: RelayNum) => {
  axiosFetch({
    url: EndpointEnum.RELAY_SERVER_PHONE,
    method: MethodEnum.DELETE,
    data: relayNum,
  });
};