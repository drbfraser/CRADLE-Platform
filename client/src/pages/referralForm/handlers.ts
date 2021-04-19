import { goBackWithFallback } from 'src/shared/utils';
import { ReferralState } from './state';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';

export const handleSubmit = (
  readingId: string,
  setSubmitError: (error: boolean) => void
) => {
  return async (values: ReferralState, { setSubmitting }: any) => {
    const url = API_URL + EndpointEnum.REFERRALS;
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
