import { useQuery } from '@tanstack/react-query';
import { HealthFacility } from 'src/shared/types';
import { axiosFetch } from 'src/shared/api/api';
import { EndpointEnum } from 'src/shared/enums';

const fetchHealthFacilities = async (): Promise<HealthFacility[]> => {
  const response = await axiosFetch.get(EndpointEnum.HEALTH_FACILITY_LIST);
  return response.data;
};

export const useHealthFacilityNames = (): string[] => {
  const query = useQuery({
    queryKey: ['healthFacilities'],
    queryFn: fetchHealthFacilities,
    select: (facilities) => facilities.map((facility) => facility.name),
  });
  return query.data ?? [];
};
