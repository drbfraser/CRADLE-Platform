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
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ['formResponse', variables.formId],
      }),
  });
};
