import { describe, it, expect } from 'vitest';
import { FormRenderStateEnum, QuestionTypeEnum } from 'src/shared/enums';
import { QAnswer } from 'src/shared/types/form/formTypes';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';
import {
  resolveLocalizedText,
  getQuestionId,
  isQuestionFieldDisabled,
  getMultiSelectValidationMessage,
  createDefaultAnswer,
} from './formQuestionUtils';

describe('resolveLocalizedText', () => {
  it('returns string values as-is', () => {
    expect(resolveLocalizedText('plain', 'english')).toBe('plain');
  });

  it('prefers the requested language key', () => {
    expect(
      resolveLocalizedText({ english: 'Hello', french: 'Bonjour' }, 'french')
    ).toBe('Bonjour');
  });

  it('falls back to english when the requested key is missing', () => {
    expect(resolveLocalizedText({ english: 'Hello', spanish: 'Hola' }, 'german')).toBe(
      'Hello'
    );
  });

  it('falls back to the first available translation, then the default', () => {
    expect(resolveLocalizedText({ french: 'Bonjour' }, 'german')).toBe('Bonjour');
    expect(resolveLocalizedText(undefined, 'english', 'fallback')).toBe('fallback');
    expect(resolveLocalizedText({}, 'english', 'fallback')).toBe('fallback');
  });
});

describe('getQuestionId', () => {
  it('prefers questionIndex when present', () => {
    expect(getQuestionId({ questionIndex: 5, order: 9 } as TQuestion)).toBe(5);
  });

  it('falls back to order when questionIndex is missing', () => {
    expect(getQuestionId({ order: 3 } as TQuestion)).toBe(3);
  });

  it('uses fallbackIndex, then -1, when neither index nor order exist', () => {
    expect(getQuestionId({} as TQuestion, 7)).toBe(7);
    expect(getQuestionId({} as TQuestion)).toBe(-1);
  });
});

describe('isQuestionFieldDisabled', () => {
  it('disables fields in VIEW mode', () => {
    expect(isQuestionFieldDisabled(FormRenderStateEnum.VIEW)).toBe(true);
  });

  it('disables fields in SUBMIT_TEMPLATE and VIS_COND_DISABLED', () => {
    expect(isQuestionFieldDisabled(FormRenderStateEnum.SUBMIT_TEMPLATE)).toBe(true);
    expect(isQuestionFieldDisabled(FormRenderStateEnum.VIS_COND_DISABLED)).toBe(true);
  });

  it('keeps fields editable in EDIT and FIRST_SUBMIT', () => {
    expect(isQuestionFieldDisabled(FormRenderStateEnum.EDIT)).toBe(false);
    expect(isQuestionFieldDisabled(FormRenderStateEnum.FIRST_SUBMIT)).toBe(false);
  });
});

describe('getMultiSelectValidationMessage', () => {
  const emptyAnswer: QAnswer = {
    questionIndex: 0,
    questionType: QuestionTypeEnum.MULTIPLE_SELECT,
    answerType: null,
    val: [],
  };

  it('returns a validation message when multi-select failed and empty', () => {
    expect(
      getMultiSelectValidationMessage(
        emptyAnswer,
        QuestionTypeEnum.MULTIPLE_SELECT,
        true
      )
    ).toBe('(Must Select At Least One Option !)');
  });

  it('returns null when validation has not failed', () => {
    expect(
      getMultiSelectValidationMessage(
        emptyAnswer,
        QuestionTypeEnum.MULTIPLE_SELECT,
        false
      )
    ).toBeNull();
  });

  it('returns null for non-multi-select types even when failed', () => {
    expect(
      getMultiSelectValidationMessage(
        emptyAnswer,
        QuestionTypeEnum.MULTIPLE_CHOICE,
        true
      )
    ).toBeNull();
  });
});

describe('createDefaultAnswer', () => {
  it('builds an empty answer keyed by questionIndex/order', () => {
    expect(
      createDefaultAnswer({
        questionIndex: 2,
        questionType: QuestionTypeEnum.STRING,
      } as TQuestion)
    ).toEqual({
      questionIndex: 2,
      questionType: QuestionTypeEnum.STRING,
      answerType: null,
      val: '',
    });
  });
});
