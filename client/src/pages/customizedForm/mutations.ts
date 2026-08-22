import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveFormResponseAsync } from 'src/shared/api';
import { PostBody } from './handlers';

export const useSubmitCustomForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: {
      formId: string | undefined;
      postBody: PostBody;
    }) => {
      return saveFormResponseAsync(values.postBody, values.formId);
    },
    onSuccess: async (_data, variables) => {
      // Cancel any in-flight fetch for this form (e.g. the edit page's own
      // mount-triggered refetch, which was dispatched with pre-edit data).
      // Without this, invalidateQueries can dedupe onto that stale in-flight
      // request instead of issuing a fresh one, leaving the cache populated
      // with the answer as it was *before* this save.
      await queryClient.cancelQueries({
        queryKey: ['formResponse', variables.formId],
      });
      queryClient.invalidateQueries({
        queryKey: ['formResponse', variables.formId],
      });
    },
  });
};
