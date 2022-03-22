import { QAnswer } from 'src/shared/types';
import { ReferralState } from './state';


export const handleSubmit2 = (
  e:React.MouseEvent<HTMLButtonElement, MouseEvent>,
  patientId: string,     
  answers:QAnswer[],     
) => { 
  let i,j,qidx,value;
  let content = `===== Request MODEL To be Submitted ===== \n`;
  for(i=0; i<answers.length; i++){
    qidx = answers[i].qidx;
    value = answers[i].value;
    content += `qidx: ${qidx}; values: ` ;
    if(answers[i].key === 'MC' || answers[i].key === 'ME'){
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
  patientId: string,
  answers:QAnswer[],       
  setSubmitError: (error: boolean) => void,      
  

) => {
  return  (values: ReferralState, { setSubmitting }: any) => {
    alert("request model to be submitted:" );
    alert(answers);
  };
};
