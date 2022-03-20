// import { goBackWithFallback } from 'src/shared/utils';
import { ReferralState } from './state';
// import { apiFetch, API_URL } from 'src/shared/api';
// import { EndpointEnum } from 'src/shared/enums';
import questions from "./form.json";
import {Question} from 'src/shared/types';

export const handleSubmit = (
  patientId: string,
  setSubmitError: (error: boolean) => void,
  setQuestions:(questions:Question[]) => void,
) => {


  // const qs  = questions;
  return async (values: ReferralState, { setSubmitting }: any) => {


    console.log(values);
  // {
  //     "Language": "Krio",
  //     "Form": "National Referral Form"
  // }

    await setQuestions(questions); 
   
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
