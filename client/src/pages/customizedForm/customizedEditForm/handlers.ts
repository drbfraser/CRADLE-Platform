/* eslint-disable no-debugger */
import { Answer, CForm, QAnswer, Question } from 'src/shared/types';

import { QuestionTypeEnum } from 'src/shared/enums';
import { goBackWithFallback } from 'src/shared/utils';
import { saveFormResponseAsync } from 'src/shared/api';

export type ApiAnswer = {
  qidx: number;
  answer: Answer;
};

export type PostBody = {
  create: CForm | undefined;
  edit: ApiAnswerForEdit[] | undefined;
};

export type ApiAnswerForEdit = {
  id: string;
  answers: Answer;
};

const VALID_QUESTION_TYPES = Object.values(QuestionTypeEnum).map((value) =>
  value.valueOf()
);

export const TransferQAnswerToAPIStandard = (
  answers: QAnswer[],
  questions: Question[]
) => {
  if (!answers || answers.length <= 0) {
    return [];
  }

  return answers
    .filter((answer) =>
      questions.some((q) => {
        if (q.questionIndex === answer.qidx) {
          return VALID_QUESTION_TYPES.includes(q.questionType);
        }
        return false;
      })
    )
    .map((answer) => {
      const question = questions.find((q) => q.questionIndex === answer.qidx);

      const options = question?.mcOptions?.map((option) => option.opt);

      const apiAnswer = {
        qidx: answer.qidx,
        answer: { mcidArray: [], text: undefined, number: undefined },
      };

      switch (question?.questionType) {
        case QuestionTypeEnum.CATEGORY:
          break;

        case QuestionTypeEnum.MULTIPLE_CHOICE:
        case QuestionTypeEnum.MULTIPLE_SELECT:
          apiAnswer.answer.mcidArray = answer.val.map((item: any) =>
            options?.indexOf(item)
          );

          break;
        case QuestionTypeEnum.STRING:
          apiAnswer.answer.text = answer.val;
          break;

        case QuestionTypeEnum.INTEGER:
        case QuestionTypeEnum.DATE:
        case QuestionTypeEnum.DATETIME:
          apiAnswer.answer.number = answer.val;
          break;

        default:
          console.error(`Unknown question type: ${question?.questionType}`);
      }

      return apiAnswer;
    });
};

export const TransferQAnswerToPostBody = (
  answers: ApiAnswer[],
  form: CForm,
  patientId: string,
  isEditForm: boolean
) => {
  const questions: Question[] = form.questions;
  const postBody: PostBody = { create: undefined, edit: undefined };

  if (isEditForm) {
    //edit a form content
    postBody.edit = answers.map((answer) => {
      const question = questions.find((q) => q.questionIndex === answer.qidx);
      const id = question ? question.id : '';
      return {
        id,
        answers: answer.answer,
      };
    });
  } else {
    //create(/fill in) a new form
    //deep copy
    const newForm: CForm = Object.assign(form);

    //remove any field not needed in the post request
    newForm.version = undefined;
    newForm.id = undefined;
    newForm.patientId = patientId;

    newForm.questions = answers.map((apiAnswer: ApiAnswer) => {
      const ques = questions.find((q) => q.questionIndex === apiAnswer.qidx);
      const question = ques ? ques : ({} as Question);
      question.answers = apiAnswer.answer;

      //isBlank
      switch (question.questionType) {
        case QuestionTypeEnum.CATEGORY:
          break;

        case QuestionTypeEnum.MULTIPLE_CHOICE:
        case QuestionTypeEnum.MULTIPLE_SELECT:
          question.isBlank = apiAnswer.answer.mcidArray!.length === 0;

          break;
        case QuestionTypeEnum.STRING:
        case QuestionTypeEnum.INTEGER:
        case QuestionTypeEnum.DATE:
        case QuestionTypeEnum.DATETIME:
          question.isBlank = !apiAnswer.answer;
          break;

        default:
          console.error(`Unknown question type: ${question.questionType}`);
      }

      //change to numMax and numMin to float type
      if (question.questionType === 'INTEGER') {
        if (question.numMin) {
          question.numMin = Number(parseFloat(question.numMin + '').toFixed(2));
        }

        if (question.numMax) {
          questions[apiAnswer.qidx].numMax = Number(
            parseFloat(question.numMax + '').toFixed(2)
          );
        }
      }

      question.shouldHidden = undefined;

      return question;
    });

    postBody.create = newForm;
  }
  return postBody;
};

export const areMcResponsesValid = (
  questions: Question[],
  answers: QAnswer[]
) =>
  //check multi-selection while when clicking the submit button
  answers
    .filter(
      (answer) =>
        answer.qtype === QuestionTypeEnum.MULTIPLE_CHOICE ||
        answer.qtype === QuestionTypeEnum.MULTIPLE_SELECT
    )
    .every((answer) => {
      const qidx = answer.qidx;
      const isHidden = questions[qidx].shouldHidden;
      const required = questions[qidx].required;

      return (
        isHidden || (required ? answer.val && answer.val.length > 0 : true)
      );
    });

export const handleSubmit = (
  patientId: string,
  answers: QAnswer[],
  // questions: Question[],
  setSubmitError: (error: boolean) => void,
  // setMultiSelectValidationFailed: (
  //   multiSelectValidationFailed: boolean
  // ) => void,
  isEditForm: boolean,
  form: CForm
) => {
  return async (values: [], { setSubmitting }: any) => {
    const questions = form.questions;

    const isValid = areMcResponsesValid(questions, answers);
    if (!isValid) {
      // setMultiSelectValidationFailed(true);
      return;
    }

    const anss: ApiAnswer[] = TransferQAnswerToAPIStandard(answers, questions);
    const postBody: PostBody = TransferQAnswerToPostBody(
      anss,
      form,
      patientId,
      isEditForm
    );

    //Create Form(first time fill in the content into the form)
    try {
      await saveFormResponseAsync(postBody, form ? form.id : undefined);
      goBackWithFallback('/patients');
    } catch (e) {
      console.error(e);
      setSubmitError(true);
      setSubmitting(false);
    }
  };
};
