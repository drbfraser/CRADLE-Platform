import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  editWorkflowTemplateAsync,
  unarchiveWorkflowTemplateAsync,
  archiveWorkflowTemplateAsync,
  createTemplate,
} from 'src/shared/api';
import { ID } from 'src/shared/constants';
import { TemplateMultiLangInput } from 'src/shared/types/workflow/workflowMultiLangTypes';

export const useCreateWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (template: TemplateMultiLangInput) => createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] });
    },
  });
};

export const useEditWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: ID;
      payload: Partial<TemplateMultiLangInput>;
    }) => editWorkflowTemplateAsync(templateId, payload),
    onSuccess: (_data, variables) => {
      // Invalidate all workflow template related queries
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] }); // Template list
      queryClient.invalidateQueries({
        queryKey: ['workflowTemplate', variables.templateId],
      }); // Individual template
    },
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
