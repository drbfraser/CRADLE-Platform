import { useQueries, useQuery } from '@tanstack/react-query';
import {
  getFormClassificationTemplates,
  getFormResponseAsync,
  getFormTemplateAsync,
  getFormTemplateLangsAsync,
} from 'src/shared/api';
import {
  FormTemplates,
  FormTemplateWithQuestions,
} from 'src/shared/types/form/formTemplateTypes';

export const useFormResponseQuery = (formId?: string) =>
  useQuery({
    queryKey: ['formResponse', formId],
    queryFn: () => {
      if (!formId || formId.trim() === '') throw new Error('Invalid formId');
      return getFormResponseAsync(formId!);
    },
    enabled: Boolean(formId && formId.trim() !== ''),
  });

export const useFormTemplateQuery = (formId: string | undefined) =>
  useQuery({
    queryKey: ['formTemplate', formId],
    queryFn: () => getFormTemplateAsync(formId!),
    enabled: !!formId,
  });

export const useFormTemplateLangsQueries = (
  templates: FormTemplates | undefined
) =>
  useQueries({
    queries:
      templates?.templates.map((template) => ({
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
