import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormRenderStateEnum, QuestionTypeEnum } from 'src/shared/enums';
import { MultipleSelectField } from './MultipleSelectField';
import {
  makeAnswer,
  makeFieldProps,
  makeFormContext,
  makeQuestion,
} from './questionFieldTestUtils';

describe('MultipleSelectField', () => {
  it('allows selecting multiple options', async () => {
    const user = userEvent.setup();
    const formContext = makeFormContext();

    render(
      <MultipleSelectField
        {...makeFieldProps({
          text: 'Symptoms',
          formContext,
          mcOptions: ['Headache', 'Fever', 'Cough'],
          question: makeQuestion({
            questionType: QuestionTypeEnum.MULTIPLE_SELECT,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.MULTIPLE_SELECT,
            val: ['Headache'],
          }),
        })}
      />
    );

    await user.click(screen.getByLabelText('Fever'));

    expect(formContext.updateAnswersByValue).toHaveBeenCalledWith(0, [
      'Headache',
      'Fever',
    ]);
  });

  it('shows the validation message when multi-select validation failed and empty', () => {
    render(
      <MultipleSelectField
        {...makeFieldProps({
          text: 'Symptoms',
          required: true,
          multiSelectValidationFailed: true,
          mcOptions: ['Headache'],
          question: makeQuestion({
            questionType: QuestionTypeEnum.MULTIPLE_SELECT,
            required: true,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.MULTIPLE_SELECT,
            val: [],
          }),
        })}
      />
    );

    expect(
      screen.getByText('(Must Select At Least One Option !)')
    ).toBeInTheDocument();
  });

  it('does not crash when answer.val is not an array yet (default empty state)', async () => {
    const user = userEvent.setup();
    const formContext = makeFormContext();

    render(
      <MultipleSelectField
        {...makeFieldProps({
          text: 'Symptoms',
          formContext,
          mcOptions: ['Headache', 'Fever'],
          question: makeQuestion({
            questionType: QuestionTypeEnum.MULTIPLE_SELECT,
          }),
          // createDefaultAnswer uses val: '' — must still work.
          answer: makeAnswer({
            questionType: QuestionTypeEnum.MULTIPLE_SELECT,
            val: '',
          }),
        })}
      />
    );

    await user.click(screen.getByLabelText('Headache'));

    expect(formContext.updateAnswersByValue).toHaveBeenCalledWith(0, [
      'Headache',
    ]);
  });

  it('disables checkboxes in VIEW mode', () => {
    render(
      <MultipleSelectField
        {...makeFieldProps({
          text: 'Symptoms',
          renderState: FormRenderStateEnum.VIEW,
          mcOptions: ['Headache'],
          question: makeQuestion({
            questionType: QuestionTypeEnum.MULTIPLE_SELECT,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.MULTIPLE_SELECT,
            val: ['Headache'],
          }),
        })}
      />
    );

    expect(screen.getByLabelText('Headache')).toBeDisabled();
  });
});
