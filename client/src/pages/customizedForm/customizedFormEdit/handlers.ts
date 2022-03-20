// import { goBackWithFallback } from 'src/shared/utils';
import { QAnswer } from 'src/shared/types';
import { ReferralState } from './state';
// import { apiFetch, API_URL } from 'src/shared/api';
// import { EndpointEnum } from 'src/shared/enums';
// import Alert from '@material-ui/lab/Alert';
// import { useAlert } from "react-alert";


export const handleSubmit2 = (
  e:React.MouseEvent<HTMLButtonElement, MouseEvent>,
  patientId: string,     
  answers:QAnswer[],     
) => { 
  // const alert = useAlert();  
  let i,j,qidx,value;
  let content = `Request Model To be Submitted: \n`;
  for(i=0; i<answers.length; i++){
    qidx = answers[i].qidx;
    value = answers[i].value;
    content += `qidx: ${qidx}; values: ` ;
    if(answers[i].key === 'MC' || answers[i].key === 'Me'){
      for(j=0; j<value?.length; j++){
      content += `${j}: ${value[j]}   `;
      }
    }else{
      content += `${value}   `;
    }
    
    content += `\n`; 
  }

  alert(content);
}



export const handleSubmit = (
  // e:React.MouseEvent<HTMLButtonElement, MouseEvent>,
  patientId: string,
  answers:QAnswer[],       
  setSubmitError: (error: boolean) => void,      
  

) => {
  // console.log("values");
  // console.log(values);
   
 
 
  // console.log(e);
  return  (values: ReferralState, { setSubmitting }: any) => {
    alert("request model to be submitted:" );
    alert(answers);
    // return  (values: ReferralState, { setSubmitting }: any) => {
    // console.log("values");
    // console.log(values); 
    // setSubmitting(false);  



    
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

      // goBackWithFallback('/patients');
    // } catch (e) {
    //   console.error(e);
    //   setSubmitError(true);
    //   setSubmitting(false);
    // }
  };
};
