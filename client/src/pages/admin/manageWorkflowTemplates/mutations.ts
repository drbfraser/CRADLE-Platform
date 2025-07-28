import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  archiveWorkflowTemplateAsync,
  unarchiveWorkflowTemplateAsync,
} from 'src/shared/api';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowTypes';

export const useEditWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (template: WorkflowTemplate) =>
      template.archived
        ? archiveWorkflowTemplateAsync(template.id)
        : unarchiveWorkflowTemplateAsync(template.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] }),
  });
};

export const useDownloadTemplateAsCSV = () => {
  return useMutation({
    mutationFn: (values: { id: string; version: string }) => {
      // TODO: Implement CSV download for workflow templates
      return Promise.resolve(new Blob(['CSV data'], { type: 'text/csv' }));
    },
  });
};
