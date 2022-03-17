// import { goBackWithFallback } from 'src/shared/utils';
import { ReferralState } from './state';
// import { apiFetch, API_URL } from 'src/shared/api';
// import { EndpointEnum } from 'src/shared/enums';

export const handleSubmit = (
  patientId: string,
  setSubmitError: (error: boolean) => void
) => {
  return async (values: ReferralState, { setSubmitting }: any) => {


    
    setSubmitting(false);
  //   const url = API_URL + EndpointEnum.REFERRALS;
  //   const postBody = JSON.stringify({
  //     patientId: patientId,
  //     ...values,
  //   });

  //   try {
  //     await apiFetch(url, {
  //       method: 'POST',
  //       body: postBody,
  //     });

  //     goBackWithFallback('/patients');
  //   } catch (e) {
  //     console.error(e);
  //     setSubmitError(true);
  //     setSubmitting(false);
  //   }
  };
};
