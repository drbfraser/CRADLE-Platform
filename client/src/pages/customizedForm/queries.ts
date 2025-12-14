import { useQueries, useQuery } from '@tanstack/react-query';
import {
  getFormClassificationTemplates,
  getFormClassificationTemplatesV2,
  getFormResponseAsync,
  getFormTemplateAsync,
  getFormTemplateAsyncV2,
  getFormTemplateLangsAsync,
} from 'src/shared/api';
import {
  FormTemplate,
  FormTemplates,
  FormTemplateWithQuestions,
  FormTemplateWithQuestionsV2,
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

// TODO: delete this when forms v2 are integrated
export const useFormTemplateQuery = (formId: string | undefined) =>
  useQuery({
    queryKey: ['formTemplate', formId],
    queryFn: () => getFormTemplateAsync(formId!),
    enabled: !!formId,
  });

export const useFormTemplateQueryV2 = (formId: string | undefined) =>
  useQuery({
    queryKey: ['formTemplate', formId],
    queryFn: () => getFormTemplateAsyncV2(formId!),
    enabled: !!formId,
  });

export const useFormTemplateLangsQueriesV2 = (
  templates: FormTemplates | undefined
) =>
  useQueries({
    queries:
      templates?.templates.map((template) => ({
        queryKey: ['formTemplateLang', template.id],
        queryFn: () => getFormTemplateLangsAsync(template.id),
      })) ?? [],
  });

// TODO: delete this when forms v2 are integrated
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

// TODO: delete this when forms v2 are integrated
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

export const usePreviousFormVersionsQueryV2 = (
  formTemplate: FormTemplateWithQuestionsV2 | undefined
) => {
  return useQuery({
    queryKey: ['formVersions', formTemplate?.classification.id],
    queryFn: async () => {
      if (formTemplate?.classification?.id) {
        const previousTemplates = await getFormClassificationTemplatesV2(
          formTemplate.classification.id
        );
        return previousTemplates.map((template) => template.version);
      }
      return [];
    },
    enabled: !!formTemplate,
  });
};
