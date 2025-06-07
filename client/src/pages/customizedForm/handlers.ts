import { Answer, CForm, QAnswer, Question } from 'src/shared/types';
import { QuestionTypeEnum } from 'src/shared/enums';

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

// This doesn't need to be exported
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
        if (q.questionIndex === answer.questionIndex) {
          return VALID_QUESTION_TYPES.includes(q.questionType);
        }
        return false;
      })
    )
    .map((answer) => {
      const question = questions.find(
        (q) => q.questionIndex === answer.questionIndex
      );

      const options = question?.mcOptions?.map((option) => option.opt);

      const apiAnswer = {
        qidx: answer.questionIndex,
        answer: { mcIdArray: [], text: undefined, number: undefined },
      };

      switch (question?.questionType) {
        case QuestionTypeEnum.CATEGORY:
          break;

        case QuestionTypeEnum.MULTIPLE_CHOICE:
        case QuestionTypeEnum.MULTIPLE_SELECT:
          apiAnswer.answer.mcIdArray = answer.val.map((item: any) =>
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
          question.isBlank = apiAnswer.answer.mcIdArray!.length === 0;

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
        answer.questionType === QuestionTypeEnum.MULTIPLE_CHOICE ||
        answer.questionType === QuestionTypeEnum.MULTIPLE_SELECT
    )
    .every((answer) => {
      const qidx = answer.questionIndex;
      const isHidden = questions[qidx].shouldHidden;
      const required = questions[qidx].required;

      return (
        isHidden || (required ? answer.val && answer.val.length > 0 : true)
      );
    });

export const areNumberResponsesValid = (
  questions: Question[],
  answers: QAnswer[]
): boolean => {
  return answers.every((ans) => {
    const q = questions.find((q) => q.questionIndex === ans.questionIndex);
    if (!q) return true; // no matching question → ignore
    if (q.numMin === undefined && q.numMax === undefined) return true; // no range set

    const val = Number(ans.val); // Formik stores raw string; coerce
    if (Number.isNaN(val)) return false; // not a number
    if (q.numMin != null && val < q.numMin) return false;
    if (q.numMax != null && val > q.numMax) return false;
    return true;
  });
};
