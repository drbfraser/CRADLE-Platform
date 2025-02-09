import { useQuery } from '@tanstack/react-query';
import { getHealthFacilitiesAsync } from './api/api';

export const useHealthFacilitiesQuery = () => {
  return useQuery({
    queryKey: ['healthcareFacilitiesList'],
    queryFn: getHealthFacilitiesAsync,
  });
};
