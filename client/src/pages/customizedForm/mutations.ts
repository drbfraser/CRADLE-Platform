import { useMutation } from '@tanstack/react-query';
import { saveFormResponseAsync } from 'src/shared/api';
import { PostBody } from './handlers';

export const useSubmitCustomForm = () => {
  return useMutation({
    mutationFn: (values: {
      formId: string | undefined;
      postBody: PostBody;
    }) => {
      return saveFormResponseAsync(values.postBody, values.formId);
    },
  });
};
