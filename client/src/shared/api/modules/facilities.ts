//move all facilities apis to here
import { axiosFetch } from '../core/http';
import { Facility } from '../../types';
import { EndpointEnum } from 'src/shared/enums';

export const saveHealthFacilityAsync = async (facility: Facility) => {
  return axiosFetch({
    method: 'POST',
    url: EndpointEnum.HEALTH_FACILITIES,
    data: facility,
  });
};

export const getHealthFacilitiesAsync = async (): Promise<Facility[]> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.HEALTH_FACILITIES,
  });

  return response.data;
};

export const getHealthFacilityAsync = async (
  healthFacility?: string
): Promise<Facility> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.HEALTH_FACILITIES + `/${healthFacility}`,
  });
  return response.data;
};
