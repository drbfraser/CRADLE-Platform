import { useQueries, useQuery } from '@tanstack/react-query';
import {
  getFormClassificationTemplates,
  getFormResponseAsync,
  getFormTemplateAsync,
  getFormTemplateLangsAsync,
} from 'src/shared/api';
import { FormTemplate, FormTemplateWithQuestions } from 'src/shared/types/types';

export const useFormResponseQuery = (formId: string) =>
  useQuery({
    queryKey: ['formResponse', formId],
    queryFn: () => getFormResponseAsync(formId),
  });

export const useFormTemplateQuery = (formId: string | undefined) =>
  useQuery({
    queryKey: ['formTemplate', formId],
    queryFn: () => getFormTemplateAsync(formId!),
    enabled: !!formId,
  });

export const useFormTemplateLangsQueries = (
  templates: FormTemplate[] | undefined
) =>
  useQueries({
    queries:
      templates?.map((template) => ({
        queryKey: ['formTemplateLang', template.id],
        queryFn: () => getFormTemplateLangsAsync(template.id),
      })) ?? [],
  });

export const usePreviousFormVersionsQuery = (
  formTemplate: FormTemplateWithQuestions | undefined
) => {
  return useQuery({
    queryKey: ['formVersions', formTemplate?.classification.id],
    queryFn: async () => {
      if (formTemplate?.classification?.id) {
        const previousTemplates = await getFormClassificationTemplates(
          formTemplate.classification.id
        );
        return previousTemplates.map((template) => template.version);
      }
      return [];
    },
    enabled: !!formTemplate,
  });
};
