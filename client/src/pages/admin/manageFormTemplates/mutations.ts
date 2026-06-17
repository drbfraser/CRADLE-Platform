import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFormTemplateCsvAsyncV2,
  editFormTemplateAsyncV2,
} from 'src/shared/api';

export const useEditFormTemplateV2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editFormTemplateAsyncV2,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['formTemplates'] }),
  });
};

export const useDownloadTemplateAsCSVv2 = () => {
  return useMutation({
    mutationFn: (values: { id: string; version: string }) =>
      getFormTemplateCsvAsyncV2(values.id, values.version),
  });
};
