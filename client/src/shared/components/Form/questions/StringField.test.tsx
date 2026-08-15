import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormRenderStateEnum, QuestionTypeEnum } from 'src/shared/enums';
import { StringField } from './StringField';
import {
  makeFieldProps,
  makeFormContext,
  makeQuestion,
} from './questionFieldTestUtils';

describe('StringField', () => {
  it('renders the label and enforces maxLength on the input', () => {
    render(
      <StringField
        {...makeFieldProps({
          text: 'Notes',
          question: makeQuestion({
            questionType: QuestionTypeEnum.STRING,
            stringMaxLength: 10,
          }),
        })}
      />
    );

    expect(screen.getByLabelText('Notes')).toHaveAttribute('maxLength', '10');
  });

  it('updates the answer on change when within max lines', () => {
    const formContext = makeFormContext({
      stringMaxLinesError: [false],
    });

    render(
      <StringField
        {...makeFieldProps({
          text: 'Notes',
          formContext,
          question: makeQuestion({
            questionType: QuestionTypeEnum.STRING,
            stringMaxLines: 2,
          }),
        })}
      />
    );

    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'hello' },
    });

    expect(formContext.updateAnswersByValue).toHaveBeenCalledWith(0, 'hello');
  });

  it('sets a max-lines error and does not update the answer when lines exceed the limit', () => {
    const setDisableSubmit = vi.fn();
    const formContext = makeFormContext({
      stringMaxLinesError: [false],
    });

    render(
      <StringField
        {...makeFieldProps({
          text: 'Notes',
          formContext,
          setDisableSubmit,
          question: makeQuestion({
            questionType: QuestionTypeEnum.STRING,
            stringMaxLines: 1,
          }),
        })}
      />
    );

    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'line1\nline2' },
    });

    expect(formContext.setStringMaxLinesError).toHaveBeenCalled();
    const nextErrors = vi.mocked(formContext.setStringMaxLinesError).mock.calls
      .at(-1)?.[0] as boolean[];
    expect(nextErrors[0]).toBe(true);
    expect(setDisableSubmit).toHaveBeenCalledWith(true);
    expect(formContext.updateAnswersByValue).not.toHaveBeenCalled();
  });

  it('disables the input in VIEW mode', () => {
    render(
      <StringField
        {...makeFieldProps({
          text: 'Notes',
          renderState: FormRenderStateEnum.VIEW,
        })}
      />
    );

    expect(screen.getByLabelText('Notes')).toBeDisabled();
  });
});
