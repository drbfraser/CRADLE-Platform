import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormRenderStateEnum, QuestionTypeEnum } from 'src/shared/enums';
import { IntegerField } from './IntegerField';
import {
  makeAnswer,
  makeFieldProps,
  makeFormContext,
  makeQuestion,
} from './questionFieldTestUtils';

describe('IntegerField', () => {
  it('renders the label and units', () => {
    render(
      <IntegerField
        {...makeFieldProps({
          text: 'Systolic',
          question: makeQuestion({
            questionType: QuestionTypeEnum.INTEGER,
            units: 'mmHg',
            numMin: 0,
            numMax: 300,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.INTEGER,
            val: 120,
          }),
        })}
      />
    );

    expect(screen.getByLabelText('Systolic')).toBeInTheDocument();
    expect(screen.getByText('mmHg')).toBeInTheDocument();
  });

  it('sets an error when the value is above max but still updates the answer', () => {
    const numberErrors: { [key: number]: string } = {};
    const formContext = makeFormContext({
      numberErrors,
      setNumberErrors: vi.fn((updater) => {
        const next =
          typeof updater === 'function' ? updater(numberErrors) : updater;
        Object.assign(numberErrors, next);
      }),
    });

    const { rerender } = render(
      <IntegerField
        {...makeFieldProps({
          text: 'Systolic',
          formContext,
          question: makeQuestion({
            questionType: QuestionTypeEnum.INTEGER,
            numMin: 0,
            numMax: 300,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.INTEGER,
            val: null,
          }),
        })}
      />
    );

    fireEvent.change(screen.getByLabelText('Systolic'), {
      target: { value: '500' },
    });

    expect(formContext.setNumberErrors).toHaveBeenCalled();
    expect(formContext.updateAnswersByValue).toHaveBeenCalled();
    const lastValue = vi
      .mocked(formContext.updateAnswersByValue)
      .mock.calls.at(-1)?.[1];
    expect(lastValue).toBe(500);

    formContext.numberErrors = {
      0: 'Value must not exceed 300',
    };
    rerender(
      <IntegerField
        {...makeFieldProps({
          text: 'Systolic',
          formContext,
          question: makeQuestion({
            questionType: QuestionTypeEnum.INTEGER,
            numMin: 0,
            numMax: 300,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.INTEGER,
            val: 500,
          }),
        })}
      />
    );

    expect(screen.getByText('Value must not exceed 300')).toBeInTheDocument();
  });

  it('sets an error when the value is below min', () => {
    const formContext = makeFormContext();

    render(
      <IntegerField
        {...makeFieldProps({
          text: 'Systolic',
          formContext,
          question: makeQuestion({
            questionType: QuestionTypeEnum.INTEGER,
            numMin: 40,
            numMax: 300,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.INTEGER,
            val: null,
          }),
        })}
      />
    );

    fireEvent.change(screen.getByLabelText('Systolic'), {
      target: { value: '10' },
    });

    const updater = vi
      .mocked(formContext.setNumberErrors)
      .mock.calls.at(-1)?.[0];
    expect(typeof updater).toBe('function');
    const next = (updater as (prev: object) => object)({});
    expect(next).toEqual({ 0: 'Value must be at least 40.' });
  });

  it('disables the input in VIEW mode', () => {
    render(
      <IntegerField
        {...makeFieldProps({
          text: 'Systolic',
          renderState: FormRenderStateEnum.VIEW,
          question: makeQuestion({ questionType: QuestionTypeEnum.INTEGER }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.INTEGER,
            val: 120,
          }),
        })}
      />
    );

    expect(screen.getByLabelText('Systolic')).toBeDisabled();
  });
});
