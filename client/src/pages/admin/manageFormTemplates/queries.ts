import { useQuery } from '@tanstack/react-query';
import { getAllFormTemplatesAsync } from 'src/shared/api/api';

export const useFormTemplatesQuery = (showArchivedTemplates: boolean) => {
  return useQuery({
    queryKey: ['formTemplates', showArchivedTemplates],
    queryFn: () => getAllFormTemplatesAsync(showArchivedTemplates),
  });
};
