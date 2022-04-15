import { CustomizedFormState } from './state';
// import questions from './form.json';
import { Question,Form } from 'src/shared/types';

import { EndpointEnum } from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';


export const handleSubmit = (
  patientId: string,
  setSubmitError: (error: boolean) => void,
  setQuestions: (questions: Question[]) => void
) => {
  return async (values: CustomizedFormState, { setSubmitting }: any) => {
    let url = API_URL + EndpointEnum.FORM_TEMPLATE + `${values.form_template_id}/versions`;
    try {
      await apiFetch(url)
      .then((resp) => resp.json())
      .then((form:Form) => {
        setQuestions(form.questions);
      })
    }
    catch(e){
        console.error(e);
        setSubmitError(true);
        setSubmitting(false);
      }
    }     
};

 