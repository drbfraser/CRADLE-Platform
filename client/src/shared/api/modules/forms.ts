import { axiosFetch } from '../core/http';
import { CForm, McOption, Question } from '../../types/form/formTypes';
import { EndpointEnum, QuestionTypeEnum } from 'src/shared/enums';
import { ApiAnswerForEdit, PostBody } from 'src/pages/customizedForm/handlers';
import { getCurrentUser } from '../core/auth';
import { reduxStore } from 'src/redux/store';

type TranslationMap = Record<string, string>;

type TemplateMcOption = {
  translations?: TranslationMap;
};

type TemplateQuestion = {
  id?: string;
  order: number;
  questionType: QuestionTypeEnum;
  questionText?: TranslationMap | string;
  required: boolean;
  allowFutureDates?: boolean;
  allowPastDates?: boolean;
  numMin?: number | null;
  numMax?: number | null;
  stringMaxLength?: number | null;
  stringMaxLines?: number | null;
  units?: string | null;
  visibleCondition?: any[];
  formTemplateId?: string;
  mcOptions?: TemplateMcOption[];
  hasCommentAttached?: boolean;
};

type SubmissionAnswer = {
  id?: string;
  questionId: string;
  answer: {
    number?: number;
    text?: string;
    mcIdArray?: number[];
    date?: string;
    comment?: string;
  };
};

type FormSubmissionV2 = {
  id: string;
  formTemplateId: string;
  patientId: string;
  dateSubmitted: number;
  lastEdited: number;
  lang: string;
  answers?: SubmissionAnswer[];
};

type FormTemplateLangV2 = {
  id?: string;
  version?: number;
  classification?: {
    name?: TranslationMap | string;
  };
  questions?: TemplateQuestion[];
};

const FORM_SUBMISSIONS_V2_ENDPOINT = '/forms/v2/submissions';

const getLocalizedText = (
  text: TranslationMap | string | undefined,
  lang: string
): string => {
  if (!text) {
    return '';
  }

  if (typeof text === 'string') {
    return text;
  }

  const directMatch = text[lang] ?? text[lang.toLowerCase()];
  if (directMatch) {
    return directMatch;
  }

  const langKey = Object.keys(text).find(
    (key) => key.toLowerCase() === lang.toLowerCase()
  );
  if (langKey) {
    return text[langKey];
  }

  return Object.values(text)[0] ?? '';
};

const toLegacyMcOptions = (
  mcOptions: TemplateMcOption[] | undefined,
  lang: string
): McOption[] => {
  if (!mcOptions) {
    return [];
  }

  return mcOptions.map((option, index) => ({
    mcId: index,
    opt: getLocalizedText(option.translations, lang),
  }));
};

const toLegacyAnswer = (
  answer: SubmissionAnswer['answer'] | undefined,
  questionType: QuestionTypeEnum
) => {
  if (!answer) {
    return undefined;
  }

  if (answer.mcIdArray) {
    return {
      mcIdArray: answer.mcIdArray,
      comment: answer.comment,
    };
  }

  if (answer.text !== undefined) {
    return {
      text: answer.text,
      comment: answer.comment,
    };
  }

  if (
    (questionType === QuestionTypeEnum.DATE ||
      questionType === QuestionTypeEnum.DATETIME) &&
    answer.date !== undefined
  ) {
    return {
      number: Number(answer.date),
      comment: answer.comment,
    };
  }

  if (answer.number !== undefined) {
    return {
      number: answer.number,
      comment: answer.comment,
    };
  }

  return undefined;
};

const hasAnswerValue = (
  answer: ApiAnswerForEdit['answers'] | undefined,
  questionType: QuestionTypeEnum
): boolean => {
  if (!answer) {
    return false;
  }

  if (answer.mcIdArray !== undefined) {
    return answer.mcIdArray.length > 0;
  }

  if (answer.text !== undefined) {
    return (answer.text ?? '').length > 0;
  }

  if (
    questionType === QuestionTypeEnum.DATE ||
    questionType === QuestionTypeEnum.DATETIME
  ) {
    return answer.number !== undefined && answer.number !== null;
  }

  return answer.number !== undefined && answer.number !== null;
};

const toV2AnswerValue = (
  answer: ApiAnswerForEdit['answers'],
  questionType: QuestionTypeEnum
) => {
  if (answer.mcIdArray !== undefined) {
    return { mcIdArray: answer.mcIdArray, comment: answer.comment };
  }

  if (answer.text !== undefined) {
    return { text: answer.text, comment: answer.comment };
  }

  if (
    questionType === QuestionTypeEnum.DATE ||
    questionType === QuestionTypeEnum.DATETIME
  ) {
    return {
      date: String(answer.number),
      comment: answer.comment,
    };
  }

  return { number: answer.number, comment: answer.comment };
};

const getCurrentUserId = async (): Promise<number> => {
  const userIdFromStore = reduxStore.getState().user.current?.id;
  if (userIdFromStore !== undefined) {
    return userIdFromStore;
  }

  const currentUser = await getCurrentUser();
  return currentUser.id;
};

export const saveFormResponseAsync = async (
  postBody: PostBody,
  formId?: string
) => {
  if (formId) {
    const payload = {
      answers: (postBody.edit ?? [])
        .filter(
          (answer) =>
            answer.id.length > 0 &&
            answer.questionId.length > 0 &&
            hasAnswerValue(answer.answers, answer.questionType)
        )
        .map((answer) => ({
          id: answer.id,
          questionId: answer.questionId,
          answer: toV2AnswerValue(answer.answers, answer.questionType),
        })),
    };

    return axiosFetch({
      url: `${FORM_SUBMISSIONS_V2_ENDPOINT}/${formId}`,
      method: 'PATCH',
      data: payload,
    });
  }

  const form = postBody.create;
  if (!form) {
    throw new Error('Missing form payload for submission.');
  }

  const formTemplateId =
    form.questions.find((question) => question.formTemplateId)
      ?.formTemplateId ?? form.id;
  if (!formTemplateId) {
    throw new Error('Missing form template id for submission.');
  }

  const patientId = form.patientId;
  if (!patientId) {
    throw new Error('Missing patient id for form submission.');
  }

  const userId = await getCurrentUserId();

  const payload = {
    formTemplateId,
    patientId,
    userId,
    lang: form.lang || 'English',
    answers: form.questions
      .filter(
        (question) =>
          question.id !== undefined &&
          hasAnswerValue(question.answers, question.questionType)
      )
      .map((question) => ({
        questionId: question.id,
        answer: toV2AnswerValue(question.answers ?? {}, question.questionType),
      })),
  };

  return axiosFetch({
    url: FORM_SUBMISSIONS_V2_ENDPOINT,
    method: 'POST',
    data: payload,
  });
};

export const getFormResponseAsync = async (formId: string): Promise<CForm> => {
  const submissionResponse = await axiosFetch.get<FormSubmissionV2>(
    `${FORM_SUBMISSIONS_V2_ENDPOINT}/${formId}`
  );

  const submission = submissionResponse.data;
  const lang = submission.lang || 'English';

  const templateResponse = await axiosFetch.get<FormTemplateLangV2>(
    `${EndpointEnum.FORM_TEMPLATES_V2}/${submission.formTemplateId}?lang=${lang}`
  );
  const template = templateResponse.data;

  const answersByQuestionId = new Map(
    (submission.answers ?? []).map((answer) => [answer.questionId, answer])
  );

  const questions: Question[] = (template.questions ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((question) => {
      const submissionAnswer = answersByQuestionId.get(question.id ?? '');

      return {
        id: submissionAnswer?.id ?? question.id ?? '',
        questionId: question.id ?? '',
        isBlank: !submissionAnswer,
        questionIndex: question.order,
        questionText: getLocalizedText(question.questionText, lang),
        questionType: question.questionType,
        required: question.required,
        allowFutureDates: question.allowFutureDates ?? true,
        allowPastDates: question.allowPastDates ?? true,
        numMin: question.numMin ?? null,
        numMax: question.numMax ?? null,
        stringMaxLength: question.stringMaxLength ?? null,
        stringMaxLines: question.stringMaxLines ?? null,
        units: question.units ?? null,
        answers: toLegacyAnswer(
          submissionAnswer?.answer,
          question.questionType
        ),
        visibleCondition: question.visibleCondition ?? [],
        formTemplateId: question.formTemplateId ?? submission.formTemplateId,
        mcOptions: toLegacyMcOptions(question.mcOptions, lang),
        hasCommentAttached: question.hasCommentAttached ?? false,
      };
    });

  const classificationName = template.classification?.name;

  return {
    dateCreated: submission.dateSubmitted,
    category: getLocalizedText(classificationName, lang),
    id: submission.id,
    lastEdited: submission.lastEdited,
    version: template.version ? String(template.version) : undefined,
    name: getLocalizedText(classificationName, lang),
    lang,
    questions,
    patientId: submission.patientId,
  };
};

export const archiveFormResponseAsync = async (
  formId: string
): Promise<CForm> => {
  const response = await axiosFetch.put(
    EndpointEnum.FORM + `/${formId}/archive`
  );
  return response.data;
};
