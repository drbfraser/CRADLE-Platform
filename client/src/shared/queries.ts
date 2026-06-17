import { useQuery } from '@tanstack/react-query';
import {
  getAllFormTemplatesAsync,
  getHealthFacilitiesAsync,
  getSecretKeyAsync,
  getAllFormTemplatesAsyncV2,
} from './api';
import { SecretKey } from './types/types';

export const useHealthFacilitiesQuery = () => {
  return useQuery({
    queryKey: ['healthcareFacilitiesList'],
    queryFn: getHealthFacilitiesAsync,
  });
};

// TODO: delete this when forms v2 are integrated
export const useFormTemplatesQuery = (showArchivedTemplates: boolean) => {
  return useQuery({
    queryKey: ['formTemplates', showArchivedTemplates],
    queryFn: () => getAllFormTemplatesAsync(showArchivedTemplates),
  });
};

export const useFormTemplatesQueryV2 = (showArchivedTemplates: boolean) => {
  return useQuery({
    queryKey: ['formTemplates', showArchivedTemplates],
    queryFn: () => getAllFormTemplatesAsyncV2(showArchivedTemplates),
  });
};

export const useSecretKeyQuery = (userId: number | undefined) => {
  return useQuery<SecretKey>({
    queryKey: ['secretKey', userId!],
    queryFn: () => getSecretKeyAsync(userId!),
    enabled: userId !== undefined,
  });
};
