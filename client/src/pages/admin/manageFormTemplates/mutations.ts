import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFormTemplateCsvAsync,
  editFormTemplateAsync,
} from 'src/shared/api';

export const useEditFormTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editFormTemplateAsync,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['formTemplates'] }),
  });
};

export const useDownloadTemplateAsCSV = () => {
  return useMutation({
    mutationFn: (values: { id: string; version: string }) =>
      getFormTemplateCsvAsync(values.id, values.version),
  });
};
