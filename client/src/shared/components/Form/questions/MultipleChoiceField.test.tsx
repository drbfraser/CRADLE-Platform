import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormRenderStateEnum, QuestionTypeEnum } from 'src/shared/enums';
import { MultipleChoiceField } from './MultipleChoiceField';
import {
  makeAnswer,
  makeFieldProps,
  makeFormContext,
  makeQuestion,
} from './questionFieldTestUtils';

describe('MultipleChoiceField', () => {
  it('renders all options and selects only one value', async () => {
    const user = userEvent.setup();
    const formContext = makeFormContext();

    render(
      <MultipleChoiceField
        {...makeFieldProps({
          text: 'Severity',
          formContext,
          mcOptions: ['Mild', 'Severe'],
          question: makeQuestion({
            questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
            val: [],
          }),
        })}
      />
    );

    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByLabelText('Mild')).toBeInTheDocument();
    expect(screen.getByLabelText('Severe')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Mild'));

    expect(formContext.updateAnswersByValue).toHaveBeenCalledWith(0, ['Mild']);
  });

  it('shows the required marker when required', () => {
    render(
      <MultipleChoiceField
        {...makeFieldProps({
          text: 'Severity',
          required: true,
          mcOptions: ['Mild'],
          question: makeQuestion({
            questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
            required: true,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
            val: [],
          }),
        })}
      />
    );

    expect(screen.getByText(/Severity \*/)).toBeInTheDocument();
  });

  it('disables radios in VIEW mode', () => {
    render(
      <MultipleChoiceField
        {...makeFieldProps({
          text: 'Severity',
          renderState: FormRenderStateEnum.VIEW,
          mcOptions: ['Mild', 'Severe'],
          question: makeQuestion({
            questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
          }),
          answer: makeAnswer({
            questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
            val: ['Mild'],
          }),
        })}
      />
    );

    expect(screen.getByLabelText('Mild')).toBeDisabled();
    expect(screen.getByLabelText('Severe')).toBeDisabled();
  });
});
