import { goBackWithFallback } from 'src/shared/utils';
import { SingleReason } from './state';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
// import { SingleReasonForm } from './SingleReasonForm';

export const handleSubmit = (
  referralId: string,
  type: string,
  setSubmitError: (error: boolean) => void
) => {



  return async (values: SingleReason, { setSubmitting }: any) => {
    // const url = API_URL + EndpointEnum.REFERRALS;
    // const postBody = JSON.stringify({
    //   referralId: referralId, 
    //   ...values,
    // });
    // console.log("****************");
    // console.log(values);
    var url = '';
    var postBody = '';
    if(type==='cancel_referral'){
      url = API_URL + EndpointEnum.REFERRALS + `/cancel-status-switch/`+ referralId;
      postBody = JSON.stringify({
        cancelReason: values.comment,
        isCancelled: true,
      });
  
    }else if(type === 'undo_cancel_referral'){
      url = API_URL + EndpointEnum.REFERRALS + `/cancel-status-switch/`+ referralId;
      postBody = JSON.stringify({
        cancelReason: values.comment,
        isCancelled: false,
      });
  
    }else if(type === 'not_attend_referral'){
      url = API_URL + EndpointEnum.REFERRALS + `/not-attend/`+ referralId;
      postBody = JSON.stringify({
        notAttendReason: values.comment,
      });
  
    }else{
      //illegal card. no handling
    }
    try {
      await apiFetch(url, {
        method: 'PUT',
        body: postBody,
      });

      goBackWithFallback('/patients');
    } catch (e) {
      console.error(e);
      setSubmitError(true);
      setSubmitting(false);
    }
  };
};
