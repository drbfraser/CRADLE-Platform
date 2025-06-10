import { useQuery } from '@tanstack/react-query';
import {
  getAllFormTemplatesAsync,
  getHealthFacilitiesAsync,
  getSecretKeyAsync,
} from './api';
import { SecretKey } from './types';

export const useHealthFacilitiesQuery = () => {
  return useQuery({
    queryKey: ['healthcareFacilitiesList'],
    queryFn: getHealthFacilitiesAsync,
  });
};

export const useFormTemplatesQuery = (showArchivedTemplates: boolean) => {
  return useQuery({
    queryKey: ['formTemplates', showArchivedTemplates],
    queryFn: () => getAllFormTemplatesAsync(showArchivedTemplates),
  });
};

export const useSecretKeyQuery = (userId: number | undefined) => {
  return useQuery<SecretKey>({
    queryKey: ['secretKey', userId!],
    queryFn: () => getSecretKeyAsync(userId!),
    enabled: userId !== undefined,
  });
};
