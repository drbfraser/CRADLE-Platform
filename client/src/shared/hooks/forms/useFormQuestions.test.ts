import { describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QuestionTypeEnum, QRelationEnum } from 'src/shared/enums';
import { Question } from 'src/shared/types/form/formTypes';
import { useFormQuestions } from './useFormQuestions';

const makeQuestion = (
  overrides: Partial<Question> & { questionIndex: number }
): Question =>
  ({
    id: `id-${overrides.questionIndex}`,
    isBlank: true,
    questionText: `Q${overrides.questionIndex}`,
    questionType: QuestionTypeEnum.STRING,
    required: false,
    allowFutureDates: true,
    allowPastDates: true,
    numMin: null,
    numMax: null,
    answers: undefined,
    visibleCondition: [],
    formTemplateId: 'template-1',
    mcOptions: [],
    hasCommentAttached: false,
    ...overrides,
  }) as Question;

describe('useFormQuestions', () => {
  it('initializes answers for every question including field types', async () => {
    const questions = [
      makeQuestion({ questionIndex: 0, questionType: QuestionTypeEnum.STRING }),
      makeQuestion({
        questionIndex: 1,
        questionType: QuestionTypeEnum.INTEGER,
      }),
      makeQuestion({
        questionIndex: 2,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        mcOptions: [{ mcId: 0, opt: 'A' }],
      }),
      makeQuestion({
        questionIndex: 3,
        questionType: QuestionTypeEnum.CATEGORY,
      }),
    ];
    const handleAnswers = vi.fn();

    const { result } = renderHook(() =>
      useFormQuestions(questions, handleAnswers)
    );

    await waitFor(() => {
      expect(result.current.answers).toHaveLength(4);
    });

    expect(result.current.answers.map((a) => a.questionType)).toEqual([
      QuestionTypeEnum.STRING,
      QuestionTypeEnum.INTEGER,
      QuestionTypeEnum.MULTIPLE_CHOICE,
      QuestionTypeEnum.CATEGORY,
    ]);
    expect(handleAnswers).toHaveBeenCalled();
  });

  it('shows a child when string EQUAL_TO condition is met', async () => {
    const questions = [
      makeQuestion({ questionIndex: 0, questionType: QuestionTypeEnum.STRING }),
      makeQuestion({
        questionIndex: 1,
        questionType: QuestionTypeEnum.STRING,
        visibleCondition: [
          {
            questionIndex: 0,
            relation: QRelationEnum.EQUAL_TO,
            answers: { text: 'yes' },
          },
        ],
      }),
    ];

    const { result } = renderHook(() => useFormQuestions(questions, vi.fn()));

    await waitFor(() => expect(result.current.answers).toHaveLength(2));

    // Child starts hidden when parent is empty.
    expect(questions[1].shouldHidden).toBe(true);

    act(() => {
      result.current.updateAnswersByValue(0, 'yes');
    });

    expect(questions[1].shouldHidden).toBe(false);
  });

  it('hides a child when string EQUAL_TO condition is not met', async () => {
    const questions = [
      makeQuestion({ questionIndex: 0, questionType: QuestionTypeEnum.STRING }),
      makeQuestion({
        questionIndex: 1,
        questionType: QuestionTypeEnum.STRING,
        visibleCondition: [
          {
            questionIndex: 0,
            relation: QRelationEnum.EQUAL_TO,
            answers: { text: 'yes' },
          },
        ],
      }),
    ];

    const { result } = renderHook(() => useFormQuestions(questions, vi.fn()));

    await waitFor(() => expect(result.current.answers).toHaveLength(2));

    act(() => {
      result.current.updateAnswersByValue(0, 'no');
    });

    expect(questions[1].shouldHidden).toBe(true);
  });

  it('shows a child when integer SMALLER_THAN condition is met', async () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.INTEGER,
      }),
      makeQuestion({
        questionIndex: 1,
        questionType: QuestionTypeEnum.STRING,
        visibleCondition: [
          {
            questionIndex: 0,
            relation: QRelationEnum.SMALLER_THAN,
            answers: { number: 10 },
          },
        ],
      }),
    ];

    const { result } = renderHook(() => useFormQuestions(questions, vi.fn()));

    await waitFor(() => expect(result.current.answers).toHaveLength(2));

    act(() => {
      result.current.updateAnswersByValue(0, 5);
    });

    expect(questions[1].shouldHidden).toBe(false);
  });

  it('shows a child when MC parent selection matches the condition', async () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        mcOptions: [
          { mcId: 0, opt: 'Option A' },
          { mcId: 1, opt: 'Option B' },
        ],
      }),
      makeQuestion({
        questionIndex: 1,
        questionType: QuestionTypeEnum.STRING,
        visibleCondition: [
          {
            questionIndex: 0,
            relation: QRelationEnum.EQUAL_TO,
            answers: { mcIdArray: [0] },
          },
        ],
      }),
    ];

    const { result } = renderHook(() => useFormQuestions(questions, vi.fn()));

    await waitFor(() => expect(result.current.answers).toHaveLength(2));

    act(() => {
      result.current.updateAnswersByValue(0, ['Option A']);
    });

    expect(questions[1].shouldHidden).toBe(false);
  });

  it('rebuilds saved MC answers and visibility using the form language', async () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        mcOptions: [
          { translations: { english: 'Yes', french: 'Oui' } } as any,
          { translations: { english: 'No', french: 'Non' } } as any,
        ],
        answers: { mcIdArray: [0] },
      }),
      makeQuestion({
        questionIndex: 1,
        questionType: QuestionTypeEnum.STRING,
        visibleCondition: [
          {
            questionIndex: 0,
            relation: QRelationEnum.EQUAL_TO,
            answers: { mcIdArray: [0] },
          },
        ],
      }),
    ];

    const { result } = renderHook(() =>
      useFormQuestions(questions, vi.fn(), 'French')
    );

    await waitFor(() => expect(result.current.answers).toHaveLength(2));

    expect(result.current.answers[0].val).toEqual(['Oui']);
    expect(questions[1].shouldHidden).toBe(false);
  });

  it('shows a child when a non-English MC selection matches the condition', async () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        mcOptions: [
          { translations: { english: 'Yes', french: 'Oui' } } as any,
          { translations: { english: 'No', french: 'Non' } } as any,
        ],
      }),
      makeQuestion({
        questionIndex: 1,
        questionType: QuestionTypeEnum.STRING,
        visibleCondition: [
          {
            questionIndex: 0,
            relation: QRelationEnum.EQUAL_TO,
            answers: { mcIdArray: [0] },
          },
        ],
      }),
    ];

    const { result } = renderHook(() =>
      useFormQuestions(questions, vi.fn(), 'French')
    );

    await waitFor(() => expect(result.current.answers).toHaveLength(2));

    act(() => {
      result.current.updateAnswersByValue(0, ['Oui']);
    });

    expect(questions[1].shouldHidden).toBe(false);
  });

  it('hides a child when MC parent selection does not match', async () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        mcOptions: [
          { mcId: 0, opt: 'Option A' },
          { mcId: 1, opt: 'Option B' },
        ],
      }),
      makeQuestion({
        questionIndex: 1,
        questionType: QuestionTypeEnum.STRING,
        visibleCondition: [
          {
            questionIndex: 0,
            relation: QRelationEnum.EQUAL_TO,
            answers: { mcIdArray: [0] },
          },
        ],
      }),
    ];

    const { result } = renderHook(() => useFormQuestions(questions, vi.fn()));

    await waitFor(() => expect(result.current.answers).toHaveLength(2));

    act(() => {
      result.current.updateAnswersByValue(0, ['Option B']);
    });

    expect(questions[1].shouldHidden).toBe(true);
  });

  it('tracks numberErrors via setter used by IntegerField', async () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.INTEGER,
        numMin: 0,
        numMax: 300,
      }),
    ];

    const { result } = renderHook(() => useFormQuestions(questions, vi.fn()));

    await waitFor(() => expect(result.current.answers).toHaveLength(1));

    act(() => {
      result.current.setNumberErrors({ 0: 'Value must not exceed 300' });
    });

    expect(result.current.numberErrors[0]).toBe('Value must not exceed 300');
  });

  it('tracks stringMaxLinesError via setter used by StringField', async () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.STRING,
        stringMaxLines: 1,
      }),
    ];

    const { result } = renderHook(() => useFormQuestions(questions, vi.fn()));

    await waitFor(() => expect(result.current.answers).toHaveLength(1));

    act(() => {
      result.current.setStringMaxLinesError([true]);
    });

    expect(result.current.stringMaxLinesError[0]).toBe(true);
  });
});
