import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormRenderStateEnum, QuestionTypeEnum } from 'src/shared/enums';
import { DateField } from './DateField';
import {
  makeAnswer,
  makeFieldProps,
  makeFormContext,
  makeQuestion,
} from './questionFieldTestUtils';

describe('DateField', () => {
  it('sets max when future dates are not allowed', () => {
    const formContext = makeFormContext({
      getCurrentDate: () => '2026-08-12',
    });

    render(
      <DateField
        {...makeFieldProps({
          text: 'Visit date',
          formContext,
          question: makeQuestion({
            questionType: QuestionTypeEnum.DATE,
            allowFutureDates: false,
            allowPastDates: true,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.DATE,
            val: null,
          }),
        })}
      />
    );

    expect(screen.getByLabelText('Visit date')).toHaveAttribute(
      'max',
      '2026-08-12'
    );
  });

  it('sets min when past dates are not allowed', () => {
    const formContext = makeFormContext({
      getCurrentDate: () => '2026-08-12',
    });

    render(
      <DateField
        {...makeFieldProps({
          text: 'Visit date',
          formContext,
          question: makeQuestion({
            questionType: QuestionTypeEnum.DATE,
            allowFutureDates: true,
            allowPastDates: false,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.DATE,
            val: null,
          }),
        })}
      />
    );

    expect(screen.getByLabelText('Visit date')).toHaveAttribute(
      'min',
      '2026-08-12'
    );
  });

  it('updates the answer with a timestamp on change', () => {
    const formContext = makeFormContext();

    render(
      <DateField
        {...makeFieldProps({
          text: 'Visit date',
          formContext,
          question: makeQuestion({
            questionType: QuestionTypeEnum.DATE,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.DATE,
            val: null,
          }),
        })}
      />
    );

    fireEvent.change(screen.getByLabelText('Visit date'), {
      target: { value: '2026-01-15' },
    });

    expect(formContext.updateAnswersByValue).toHaveBeenCalled();
    const timestamp = vi.mocked(formContext.updateAnswersByValue).mock.calls.at(
      -1
    )?.[1];
    expect(typeof timestamp).toBe('number');
  });

  it('disables the input in VIEW mode', () => {
    render(
      <DateField
        {...makeFieldProps({
          text: 'Visit date',
          renderState: FormRenderStateEnum.VIEW,
          question: makeQuestion({ questionType: QuestionTypeEnum.DATE }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.DATE,
            val: null,
          }),
        })}
      />
    );

    expect(screen.getByLabelText('Visit date')).toBeDisabled();
  });
});
