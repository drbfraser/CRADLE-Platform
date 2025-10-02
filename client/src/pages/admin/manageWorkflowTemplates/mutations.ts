import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  editWorkflowTemplateAsync,
  getWorkflowTemplateCsvAsync,
} from 'src/shared/api';

export const useEditWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editWorkflowTemplateAsync,
    onSuccess: (variables) => {
      // Invalidate all workflow template related queries
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] }); // Template list
      queryClient.invalidateQueries({
        queryKey: ['workflowTemplate', variables.id],
      }); // Individual template
    },
  });
};

export const useDownloadTemplateAsCSV = () => {
  return useMutation({
    mutationFn: (values: { id: string; version: string }) =>
      getWorkflowTemplateCsvAsync(values.id, values.version),
  });
};
