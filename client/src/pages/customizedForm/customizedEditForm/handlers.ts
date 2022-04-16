import { QAnswer,Answer,Question } from 'src/shared/types';
// import { ReferralState } from './state';
// import { EndpointEnum } from 'src/shared/enums';
// import { apiFetch, API_URL } from 'src/shared/api';

export const handleSubmit2 = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  patientId: string,
  answers: QAnswer[],
 
) => {
  let i, j, qidx, value;
  let content = `===== Request MODEL To be Submitted ===== \n`;
  for (i = 0; i < answers.length; i++) {
    qidx = answers[i].qidx;
    value = answers[i].val;
    content += `qidx: ${qidx}; values: `;
    if (answers[i].qtype === 'MULTIPLE_CHOICE' || answers[i].qtype === 'MULTIPLE_SELECT') {
      for (j = 0; j < value?.length; j++) {
        content += `${j}: ${value[j]}   `;
      }
    } else {
      content += `${value}   `;
    }

    content += `\n`;
  }

  alert(content);
};




// export type QAnswer = {
//   qidx: number | null;
//   qtype: string | null; 
//   anstype: string | null;//value,text,mc,me,comment
//   val: any;
// };
// export interface QCondition {
//   qidx: number;
//   relation: string; //* better to update to QRelationEnum [EQUAL_TO];
//   answers: Answer;//*
// };
// export type Answer = {
//   number?: number | undefined;
//   text?: string | undefined;
//   mcidArray?: number[] | undefined; 
// };

export type API_Answer = {
  qidx: number | null;
  answer: Answer;
};

// const [answers, _setAnswers] = useState<QAnswer[]>([
//   { qidx: null, qtype: null, anstype:null, val: null },
// ]);
export const TransferQAnswerToAPIStandard = (qans: QAnswer[],  questions: Question[]) => {
  
  if(!(qans && qans.length>0)){
    return [];
  }

  const qanswers = [...qans];
  let anss:API_Answer[] = [];
  let i,  q_idx:number; //answer -> Answer type
  for (i = 0; i < qanswers.length; i++) {
    let q_answer = qanswers[i];
    q_idx = q_answer.qidx;//
    if (q_answer.qtype === 'mc' || q_answer.qtype === 'me') {
        let mcid_arr:any = []; 
        q_answer.val!.forEach((item:any) => {//val是选项的字符串数组
          let q_opts = questions[q_idx].mcOptions?.map(option=>option.opt);
          //!!!!!!!!!!!!!!!!!!!!!!!!!!! 这个地方是用index直接取 m_option_id，要注意一下!!!!!!
          let q_opts_id:number = q_opts!.indexOf(item);
          mcid_arr.push(q_opts_id) 
        });
        anss.push({'qidx': q_idx,  answer:{'mcidArray': [...mcid_arr!]}});
    }
    else if (q_answer.qtype === 'STRING'){
      anss.push({'qidx': q_idx,  answer:{'text': q_answer.val}});
    }else if (q_answer.qtype === 'INTEGER'){
      anss.push({'qidx': q_idx,  answer:{'number': q_answer.val}});
    }else{
      console.log("invalid type !");
    }
  }
   return anss;
};

export const handleSubmit = (
  patientId: string,
  answers: QAnswer[],
  questions: Question[],
  setSubmitError: (error: boolean) => void,
  setIsSubmitButtonClick: (submitButtonClick: boolean) => void,
  setAnswers:(answers: any)=> void,
  
) => {
  return async (values: [], { setSubmitting }: any) => {
    // alert('request model to be submitted:');
    // alert(answers);
    let anss = TransferQAnswerToAPIStandard(answers, questions);
    console.log(answers);
    console.log(anss);
    
    // const url = API_URL + EndpointEnum.FORM + '/'+`${values.form_template_id}?lang=${values.lang}`;





    setIsSubmitButtonClick(true);
    setAnswers(answers);
    setSubmitting(false);
                                 
  };
};



// export const handleSubmit1111 = (
//   patientId: string,
//   setSubmitError: (error: boolean) => void,
//   setQuestions: (questions: Question[]) => void
// ) => {
//   return async (values: CustomizedFormState, { setSubmitting }: any) => {
//     // console.log(values);
//     const url = API_URL + EndpointEnum.FORM_TEMPLATE + '/'+`${values.form_template_id}?lang=${values.lang}`;
   
//     try {
//       await apiFetch(url)
//       .then((resp) => resp.json())
//       .then((form:Form) => {
//         console.log(form);
//         console.log(form.questions);
//         setQuestions(form.questions);
//       })
//     }
//     catch(e){
//         console.error(e);
//         setSubmitError(true);
//         setSubmitting(false);
//       }
//     }     
// };
