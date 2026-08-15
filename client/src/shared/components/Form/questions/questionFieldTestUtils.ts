import { FormRenderStateEnum, QuestionTypeEnum } from 'src/shared/enums';
import { QAnswer } from 'src/shared/types/form/formTypes';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';
import { FormQuestionsContext, QuestionFieldProps } from './types';
import { vi } from 'vitest';

export const makeFormContext = (
  overrides: Partial<FormQuestionsContext> = {}
): FormQuestionsContext => ({
  updateAnswersByValue: vi.fn(),
  numberErrors: {},
  setNumberErrors: vi.fn((updater) => {
    if (typeof updater === 'function') {
      updater({});
    }
  }),
  stringMaxLinesError: [],
  setStringMaxLinesError: vi.fn(),
  getCurrentDate: () => '2026-08-12',
  isQuestion: () => true,
  ...overrides,
});

export const makeQuestion = (
  overrides: Partial<TQuestion> = {}
): TQuestion =>
  ({
    id: 'q1',
    order: 0,
    questionIndex: 0,
    questionType: QuestionTypeEnum.STRING,
    required: false,
    allowPastDates: true,
    allowFutureDates: true,
    categoryIndex: null,
    units: null,
    numMin: null,
    numMax: null,
    stringMaxLength: null,
    stringMaxLines: null,
    visibleCondition: [],
    questionText: { english: 'Question' },
    mcOptions: [],
    hasCommentAttached: false,
    questionStringId: 'qs1',
    userQuestionId: 'uq1',
    ...overrides,
  }) as TQuestion;

export const makeAnswer = (overrides: Partial<QAnswer> = {}): QAnswer => ({
  questionIndex: 0,
  questionType: QuestionTypeEnum.STRING,
  answerType: null,
  val: '',
  ...overrides,
});

export const makeFieldProps = (
  overrides: Partial<QuestionFieldProps> = {}
): QuestionFieldProps => ({
  question: makeQuestion(),
  answer: makeAnswer(),
  renderState: FormRenderStateEnum.FIRST_SUBMIT,
  text: 'Question label',
  qid: 0,
  required: false,
  formContext: makeFormContext(),
  ...overrides,
});
