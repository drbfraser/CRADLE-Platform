import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  editWorkflowTemplateAsync,
  getWorkflowTemplateCsvAsync,
} from 'src/shared/api';

export const useEditWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editWorkflowTemplateAsync,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] }),
  });
};

export const useDownloadTemplateAsCSV = () => {
  return useMutation({
    mutationFn: (values: { id: string; version: string }) =>
      getWorkflowTemplateCsvAsync(values.id, values.version),
  });
};
