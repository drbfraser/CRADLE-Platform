import { useQuery } from '@tanstack/react-query';
import { getHealthFacilitiesAsync, getSecretKeyAsync } from './api/api';
import { SecretKey } from './types';

export const useHealthFacilitiesQuery = () => {
  return useQuery({
    queryKey: ['healthcareFacilitiesList'],
    queryFn: getHealthFacilitiesAsync,
  });
};

export const useSecretKeyQuery = (userId: number | undefined) => {
  return useQuery<SecretKey>({
    queryKey: ['secretKey', userId!],
    queryFn: () => getSecretKeyAsync(userId!),
    enabled: userId !== undefined,
  });
};
