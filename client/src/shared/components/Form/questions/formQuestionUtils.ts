import { QuestionTypeEnum, FormRenderStateEnum } from 'src/shared/enums';
import { QAnswer } from 'src/shared/types/form/formTypes';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';

export const resolveLocalizedText = (
  value: string | Record<string, string> | undefined,
  languageKey: string,
  fallback = ''
): string => {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  return (
    value[languageKey] ?? value.english ?? Object.values(value)[0] ?? fallback
  );
};

export const getQuestionId = (
  question: TQuestion,
  fallbackIndex?: number
): number => {
  if (typeof question.questionIndex === 'number') {
    return question.questionIndex;
  }

  if (typeof question.order === 'number') {
    return question.order;
  }

  return fallbackIndex ?? -1;
};

export const isQuestionFieldDisabled = (
  renderState: FormRenderStateEnum
): boolean =>
  renderState === FormRenderStateEnum.VIEW ||
  renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ||
  renderState === FormRenderStateEnum.VIS_COND_DISABLED;

export const getQuestionGridProps = (
  renderState: FormRenderStateEnum,
  isCategory = false
) => {
  const isVisCond =
    renderState === FormRenderStateEnum.VIS_COND ||
    renderState === FormRenderStateEnum.VIS_COND_DISABLED;

  if (isCategory) {
    return {
      xs: 12,
      sm: renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? 7 : 12,
      md: renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? 5 : 12,
    };
  }

  return {
    xs: renderState === FormRenderStateEnum.SUBMIT_TEMPLATE ? 10 : 12,
    md: isVisCond ? 12 : 6,
    lg: isVisCond ? 12 : 4,
  };
};

export const getMultiSelectValidationMessage = (
  answer: QAnswer,
  type: QuestionTypeEnum,
  multiSelectValidationFailed?: boolean
): string | null => {
  if (!multiSelectValidationFailed) {
    return null;
  }
  if (type === QuestionTypeEnum.MULTIPLE_SELECT && !answer.val!.length) {
    return '(Must Select At Least One Option !)';
  }
  return null;
};

/** Returns validation message text for multi-select required fields. */
export const generateValidationLine = getMultiSelectValidationMessage;

export const createDefaultAnswer = (question: TQuestion): QAnswer => ({
  questionIndex: getQuestionId(question),
  questionType: question.questionType,
  answerType: null,
  val: '',
});
