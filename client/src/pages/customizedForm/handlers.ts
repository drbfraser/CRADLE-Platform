// import { goBackWithFallback } from 'src/shared/utils';
import { QAnswer } from 'src/shared/types';
import { ReferralState } from './state';
// import { apiFetch, API_URL } from 'src/shared/api';
// import { EndpointEnum } from 'src/shared/enums';

export const handleSubmit = (
  // e:React.MouseEvent<HTMLButtonElement, MouseEvent>,
  patientId: string,
  answers:QAnswer[],       
  setSubmitError: (error: boolean) => void 
  

) => {
  console.log("values");
  // console.log(values);

  // console.log(e);
  // return async (values: ReferralState, { setSubmitting }: any) => {
    return  (values: ReferralState, { setSubmitting }: any) => {
    console.log("values");
    console.log(values); 
    setSubmitting(false);  



    
    // const url = API_URL + EndpointEnum.REFERRALS;
    // const postBody = JSON.stringify({
    //   patientId: patientId,
    //   ...values,
    // });
 
    // try {
    //   await apiFetch(url, {
    //     method: 'POST',
    //     body: postBody,
    //   });

    //   goBackWithFallback('/patients');
    // } catch (e) {
    //   console.error(e);
    //   setSubmitError(true);
    //   setSubmitting(false);
    // }
  };
};
