import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  editWorkflowTemplateAsync,
  getWorkflowTemplateCsvAsync,
  unarchiveWorkflowTemplateAsync,
  archiveWorkflowTemplateAsync,
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

export const useArchiveWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      archiveWorkflowTemplateAsync(templateId),
    onSuccess: (_data, templateId) => {
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] });
      queryClient.invalidateQueries({
        queryKey: ['workflowTemplate', templateId],
      });
    },
  });
};

export const useUnarchiveWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      unarchiveWorkflowTemplateAsync(templateId),
    onSuccess: (_data, templateId) => {
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] });
      queryClient.invalidateQueries({
        queryKey: ['workflowTemplate', templateId],
      });
    },
  });
};
