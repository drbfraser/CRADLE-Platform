import { QAnswer, Answer, Question, CForm } from 'src/shared/types';
import { EndpointEnum } from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';
import { goBackWithFallback } from 'src/shared/utils';

export type API_Answer = {
  qidx: number;
  answer: Answer;
};

export type post_body = {
  creat: CForm | undefined;
  edit: API_Answer_For_Edit[] | undefined;
};

export type API_Answer_For_Edit = {
  id: string;
  answers: Answer;
};

export const TransferQAnswerToAPIStandard = (
  qans: QAnswer[],
  questions: Question[]
) => {
  if (!(qans && qans.length > 0)) {
    return [];
  }
  const qanswers = [...qans];
  let anss: API_Answer[] = [];
  let i; //answer -> Answer type
  for (i = 0; i < qanswers.length; i++) {
    let q_answer = qanswers[i];
    const q_idx: number = q_answer.qidx;
    //We do NOT collect answers to those 'hidden' questions!!!!!!!!!!
    if (
      questions[q_idx].questionType === 'CATEGORY' ||
      questions[q_idx].shouldHidden === true
    ) {
      anss.push({
        qidx: q_idx,
        answer: { mcidArray: [], text: undefined, number: undefined },
      });
    } else if (
      q_answer.qtype === 'MULTIPLE_CHOICE' ||
      q_answer.qtype === 'MULTIPLE_SELECT'
    ) {
      let mcid_arr: any = [];
      q_answer.val!.forEach((item: any) => {
        //val IS THE 'CONTENT'(STRING) OF THE OPTION!

        let q_opts = questions[q_idx].mcOptions?.map((option) => option.opt);
        //!!!!!!!![IMPORTANT!!] WE USE INDEX TO FETCH m_option_id!!!!!!
        let q_opts_id: number = q_opts!.indexOf(item);
        mcid_arr.push(q_opts_id);
      });
      anss.push({ qidx: q_idx, answer: { mcidArray: [...mcid_arr!] } });
    } else if (q_answer.qtype === 'STRING') {
      anss.push({ qidx: q_idx, answer: { text: q_answer.val } });
    } else if (q_answer.qtype === 'INTEGER' || q_answer.qtype === 'DATE') {
      anss.push({ qidx: q_idx, answer: { number: q_answer.val } });
    } else {
      console.log('invalid type !');
    }
  }
  return anss;
};

export const TransferQAnswerToPostBody = (
  api_anss: API_Answer[],
  form: CForm,
  patientId: string,
  isEditForm: boolean
) => {
  let postBody: post_body = { creat: undefined, edit: undefined };

  if (isEditForm === false) {
    //create(/fill in) a new form
    //deep copy
    let new_form: CForm = Object.assign(form);
    console.log(form);
    console.log(new_form);
    //remove any field not needed in the post request
    new_form.version = undefined;
    new_form.id = undefined;
    new_form.patientId = patientId;

    let qs = Object.assign(form.questions);
    api_anss.forEach((ans_with_qidx: API_Answer) => {
      qs[ans_with_qidx.qidx].answers = ans_with_qidx.answer;

      //isBlank
      if (
        (qs[ans_with_qidx.qidx].questionType === 'MULTIPLE_CHOICE' ||
          qs[ans_with_qidx.qidx].questionType === 'MULTIPLE_SELECT') &&
        ans_with_qidx.answer.mcidArray!.length > 0
      ) {
        qs[ans_with_qidx.qidx].isBlank = false;
      } else {
        if (
          ans_with_qidx.answer !== null &&
          ans_with_qidx.answer !== undefined
        ) {
          qs[ans_with_qidx.qidx].isBlank = false;
        } else {
          qs[ans_with_qidx.qidx].isBlank = true;
        }
      }

      //change to numMax and numMin to float type
      if (qs[ans_with_qidx.qidx].questionType === 'INTEGER') {
        if (
          !(
            qs[ans_with_qidx.qidx].numMin === null ||
            qs[ans_with_qidx.qidx].numMin === undefined
          )
        ) {
          qs[ans_with_qidx.qidx].numMin = Number(
            parseFloat(qs[ans_with_qidx.qidx].numMin).toFixed(2)
          );
        }

        if (
          !(
            qs[ans_with_qidx.qidx].numMax === null ||
            qs[ans_with_qidx.qidx].numMax === undefined
          )
        ) {
          qs[ans_with_qidx.qidx].numMax = Number(
            parseFloat(qs[ans_with_qidx.qidx].numMax).toFixed(2)
          );
        }
      }

      qs[ans_with_qidx.qidx].shouldHidden = undefined;
      qs[ans_with_qidx.qidx].id = undefined;
      //form's questions should be TQuestion type, but we use Question type to match it(when doing APIFetch). need to notice the possbile tailling bugs
      qs[ans_with_qidx.qidx].questionId = undefined;
    });

    new_form.questions = qs;
    postBody.creat = new_form;
    return postBody;
  } else {
    //edit a form content
    const questions: Question[] = form.questions;
    let post_body_edit: API_Answer_For_Edit[] = [];
    api_anss.forEach((ans_with_qidx: API_Answer) => {
      let qid = questions[ans_with_qidx.qidx].id;
      let api_ans_for_edit: API_Answer_For_Edit = {
        id: qid,
        answers: ans_with_qidx.answer,
      };
      post_body_edit.push(api_ans_for_edit);
    });
    postBody.edit = post_body_edit;
    return postBody;
  }
};

export const passValidation = (questions: Question[], answers: QAnswer[]) => {
  //check multi-selection while when clicking the submit button
  let i;
  for (i = 0; i < answers.length; i++) {
    let ans = answers[i];
    if (ans.qtype === 'MULTIPLE_SELECT') {
      const qidx = ans.qidx;
      const required = questions[qidx].required;
      const shouldHidden = questions[qidx].shouldHidden;
      if (required && !shouldHidden && (!ans.val || !ans.val!.length)) {
        return false;
      }
    }
  }
  return true;
};

export const handleSubmit = (
  patientId: string,
  answers: QAnswer[],
  // questions: Question[],
  setSubmitError: (error: boolean) => void,
  setMultiSelectValidationFailed: (
    multiSelectValidationFailed: boolean
  ) => void,
  setAnswers: (answers: any) => void,
  isEditForm: boolean,
  form: CForm
) => {
  return async (values: [], { setSubmitting }: any) => {
    let questions = form.questions;
    if (!passValidation(questions, answers)) {
      setMultiSelectValidationFailed(true);
      return;
    } else {
      const anss: API_Answer[] = TransferQAnswerToAPIStandard(
        answers,
        questions
      );
      const postBody: post_body = TransferQAnswerToPostBody(
        anss,
        form,
        patientId,
        isEditForm
      );
      let url = '';
      let request_type = '';

      //Create Form(first time fill in the content into the form)
      if (isEditForm === false) {
        url = API_URL + EndpointEnum.FORM;
        request_type = 'POST';
        try {
          await apiFetch(url, {
            method: request_type,
            body: JSON.stringify(postBody.creat),
          });
          goBackWithFallback('/patients');
        } catch (e) {
          console.error(e);
          setSubmitError(true);
          setSubmitting(false);
        }
      }
      //Edit Form
      else {
        url = API_URL + EndpointEnum.FORM + `/${form.id}`;
        request_type = 'PUT';
        try {
          await apiFetch(url, {
            method: request_type,
            body: JSON.stringify({ questions: postBody.edit }),
          });
          goBackWithFallback('/patients');
        } catch (e) {
          console.error(e);
          setSubmitError(true);
          setSubmitting(false);
        }
      }
    }
  };
};
