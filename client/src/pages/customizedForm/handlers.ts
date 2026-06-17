import {
  Answer,
  CForm,
  QAnswer,
  Question,
} from 'src/shared/types/form/formTypes';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';
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
  questionId: string;
  answers: Answer;
  questionType: QuestionTypeEnum;
};

const VALID_QUESTION_TYPES = Object.values(QuestionTypeEnum).map((value) =>
  value.valueOf()
);

type QuestionLike = Question | TQuestion;

const getQuestionIndex = (question: QuestionLike): number => {
  if (
    'questionIndex' in question &&
    typeof question.questionIndex === 'number'
  ) {
    return question.questionIndex;
  }

  if ('order' in question && typeof question.order === 'number') {
    return question.order;
  }

  return -1;
};

const getQuestionByIndex = (
  questions: QuestionLike[],
  index: number
): QuestionLike | undefined =>
  questions.find((question) => getQuestionIndex(question) === index);

const getOptionLabel = (option: any): string => {
  if (!option) {
    return '';
  }

  if (typeof option.opt === 'string') {
    return option.opt;
  }

  return (
    option.translations?.english ??
    Object.values(option.translations ?? {})[0] ??
    ''
  );
};

// This doesn't need to be exported
export const TransferQAnswerToAPIStandard = (
  answers: QAnswer[],
  questions: Question[]
) => {
  const questionList = questions as QuestionLike[];

  if (!answers || answers.length <= 0) {
    return [];
  }

  return answers
    .filter((answer) =>
      questionList.some(
        (question) =>
          getQuestionIndex(question) === answer.questionIndex &&
          VALID_QUESTION_TYPES.includes(question.questionType)
      )
    )
    .map((answer) => {
      const question = getQuestionByIndex(questionList, answer.questionIndex);

      const options = (question?.mcOptions ?? []).map((option) =>
        getOptionLabel(option)
      );

      const apiAnswer = {
        qidx: answer.questionIndex,
        answer: {} as Answer,
      };

      switch (question?.questionType) {
        case QuestionTypeEnum.CATEGORY:
          break;

        case QuestionTypeEnum.MULTIPLE_CHOICE:
        case QuestionTypeEnum.MULTIPLE_SELECT:
          apiAnswer.answer.mcIdArray = (answer.val ?? [])
            .map((item: any) => options.indexOf(item))
            .filter((index: number) => index >= 0);

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
  const questions: QuestionLike[] = form.questions as unknown as QuestionLike[];
  const postBody: PostBody = { create: undefined, edit: undefined };

  if (isEditForm) {
    //edit a form content
    postBody.edit = answers.map((answer) => {
      const question = getQuestionByIndex(questions, answer.qidx);
      const id = question?.id ?? '';
      const questionId = question?.questionId ?? question?.id ?? '';
      return {
        id,
        questionId,
        answers: answer.answer,
        questionType: question?.questionType ?? QuestionTypeEnum.STRING,
      };
    });
  } else {
    //create(/fill in) a new form
    //deep copy
    const newForm: CForm = { ...form };

    //remove any field not needed in the post request
    newForm.version = undefined;
    newForm.patientId = patientId;

    newForm.questions = answers
      .map((apiAnswer: ApiAnswer) => {
        const question = getQuestionByIndex(questions, apiAnswer.qidx);
        if (!question) {
          return null;
        }

        const normalizedQuestion = {
          ...(question as Question),
          questionIndex: getQuestionIndex(question),
        } as Question;

        normalizedQuestion.answers = apiAnswer.answer;

        //isBlank
        switch (normalizedQuestion.questionType) {
          case QuestionTypeEnum.CATEGORY:
            break;

          case QuestionTypeEnum.MULTIPLE_CHOICE:
          case QuestionTypeEnum.MULTIPLE_SELECT:
            normalizedQuestion.isBlank =
              (apiAnswer.answer.mcIdArray ?? []).length === 0;

            break;
          case QuestionTypeEnum.STRING:
            normalizedQuestion.isBlank = !apiAnswer.answer.text;
            break;
          case QuestionTypeEnum.INTEGER:
          case QuestionTypeEnum.DATE:
          case QuestionTypeEnum.DATETIME:
            normalizedQuestion.isBlank = apiAnswer.answer.number === undefined;
            break;

          default:
            console.error(
              `Unknown question type: ${normalizedQuestion.questionType}`
            );
        }

        //change to numMax and numMin to float type
        if (normalizedQuestion.questionType === QuestionTypeEnum.INTEGER) {
          if (
            normalizedQuestion.numMin !== null &&
            normalizedQuestion.numMin !== undefined
          ) {
            normalizedQuestion.numMin = Number(
              parseFloat(String(normalizedQuestion.numMin)).toFixed(2)
            );
          }

          if (
            normalizedQuestion.numMax !== null &&
            normalizedQuestion.numMax !== undefined
          ) {
            normalizedQuestion.numMax = Number(
              parseFloat(String(normalizedQuestion.numMax)).toFixed(2)
            );
          }
        }

        normalizedQuestion.shouldHidden = undefined;

        return normalizedQuestion;
      })
      .filter((question): question is Question => question !== null);

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
      const question = getQuestionByIndex(questions as QuestionLike[], qidx) as
        | Question
        | TQuestion
        | undefined;

      if (!question) {
        return true;
      }

      const isHidden = (question as Question).shouldHidden;
      const required = question.required;
      const selectedCount = Array.isArray(answer.val)
        ? answer.val.length
        : answer.val
          ? 1
          : 0;

      return isHidden || (required ? selectedCount > 0 : true);
    });

export const areNumberResponsesValid = (
  questions: Question[],
  answers: QAnswer[]
): boolean => {
  return answers.every((ans) => {
    const q = getQuestionByIndex(
      questions as QuestionLike[],
      ans.questionIndex
    );
    if (!q) return true; // no matching question → ignore
    const isNumericQuestion =
      q.questionType === QuestionTypeEnum.INTEGER ||
      q.questionType === QuestionTypeEnum.DATE ||
      q.questionType === QuestionTypeEnum.DATETIME;

    if (!isNumericQuestion) return true;

    if (q.numMin == null && q.numMax == null) return true; // no range set

    const val = Number(ans.val); // Formik stores raw string; coerce
    if (Number.isNaN(val)) return false; // not a number
    if (q.numMin != null && val < q.numMin) return false;
    if (q.numMax != null && val > q.numMax) return false;
    return true;
  });
};
