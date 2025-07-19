import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleArchiveTemplate } from 'src/shared/api/modules/workflowTemplates';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowTypes';

export const useEditWorkflowTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (template: WorkflowTemplate) =>
      toggleArchiveTemplate(template.id, template.archived),
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
