import { goBackWithFallback } from 'src/shared/utils';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';
import { ReferralState } from './state';
import { apiFetch } from 'src/shared/utils/api';

export const handleSubmit = (
  readingId: string,
  setSubmitError: (error: boolean) => void
) => {
  return async (values: ReferralState, { setSubmitting }: any) => {
    const url = BASE_URL + EndpointEnum.REFERRALS;
    const postBody = JSON.stringify({
      readingId: readingId,
      ...values,
    });

    try {
      await apiFetch(url, {
        method: 'POST',
        body: postBody,
      });

      goBackWithFallback('/patients');
    } catch (e) {
      console.error(e);
      setSubmitError(true);
    }

    setSubmitting(false);
  };
};
