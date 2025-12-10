import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  editWorkflowTemplateAsync,
  getWorkflowTemplateCsvAsync,
  unarchiveWorkflowTemplateAsync,
  archiveWorkflowTemplateAsync,
  createTemplate,
} from 'src/shared/api';
import { WorkflowTemplate, TemplateInput } from 'src/shared/types/workflow/workflowApiTypes';

export const useCreateWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (template: TemplateInput) => createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] });
    },
  });
};

export const useEditWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ template }: { template: Partial<WorkflowTemplate> }) =>
      editWorkflowTemplateAsync(template),
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
