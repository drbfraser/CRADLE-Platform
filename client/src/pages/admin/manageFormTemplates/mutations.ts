import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFormTemplateCsvAsync,
  editFormTemplateAsync,
  getFormTemplateCsvAsyncV2,
  editFormTemplateAsyncV2,
} from 'src/shared/api';

// TODO: delete this one once forms v2 have been integrated
export const useEditFormTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editFormTemplateAsync,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['formTemplates'] }),
  });
};

export const useEditFormTemplateV2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editFormTemplateAsyncV2,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['formTemplates'] }),
  });
};

export const useDownloadTemplateAsCSV = () => {
  return useMutation({
    mutationFn: (values: { id: string; version: string }) =>
      getFormTemplateCsvAsync(values.id, values.version),
  });
};

export const useDownloadTemplateAsCSVv2 = () => {
  return useMutation({
    mutationFn: (values: { id: string; version: string }) =>
      getFormTemplateCsvAsyncV2(values.id, values.version),
  });
};
