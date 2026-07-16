import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formQuestionsToWorkflowVariables,
  questionToWorkflowVariable,
  getStepWorkflowVariables,
} from 'src/shared/utils/workflow/getStepWorkflowVariables';
import { QuestionTypeEnum } from 'src/shared/enums';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';
import * as api from 'src/shared/api';

vi.mock('src/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return {
    ...actual,
    getWorkflowVariables: vi.fn(),
    getFormTemplateAsyncV2: vi.fn(),
  };
});

const makeQuestion = (
  overrides: Partial<TQuestion> & {
    userQuestionId: string;
    questionType: QuestionTypeEnum;
  }
): TQuestion =>
  ({
    questionText: { English: 'Sample' },
    ...overrides,
  }) as TQuestion;

describe('formQuestionsToWorkflowVariables', () => {
  it('maps supported question types to forms[latest] variables', () => {
    const questions = [
      makeQuestion({
        userQuestionId: 'q1',
        questionType: QuestionTypeEnum.STRING,
        questionText: { English: 'Symptoms' },
      }),
      makeQuestion({
        userQuestionId: 'q2',
        questionType: QuestionTypeEnum.INTEGER,
        questionText: { English: 'Score' },
      }),
    ];

    expect(formQuestionsToWorkflowVariables(questions)).toEqual([
      expect.objectContaining({
        tag: 'forms[latest].q1',
        type: 'string',
        description: 'Symptoms',
        namespace: 'forms',
      }),
      expect.objectContaining({
        tag: 'forms[latest].q2',
        type: 'integer',
        description: 'Score',
      }),
    ]);
  });

  it('skips category and questions without userQuestionId', () => {
    const questions = [
      makeQuestion({
        userQuestionId: '',
        questionType: QuestionTypeEnum.STRING,
      }),
      makeQuestion({
        userQuestionId: 'cat',
        questionType: QuestionTypeEnum.CATEGORY,
      }),
    ];
    // empty userQuestionId is falsy → skipped; CATEGORY not in type map
    expect(formQuestionsToWorkflowVariables(questions)).toEqual([]);
  });

  it('questionToWorkflowVariable uses first available translation', () => {
    const q = makeQuestion({
      userQuestionId: 'q1',
      questionType: QuestionTypeEnum.DATE,
      questionText: { French: 'Date de naissance' },
    });
    expect(questionToWorkflowVariable(q).description).toBe(
      'Date de naissance'
    );
    expect(questionToWorkflowVariable(q).type).toBe('date');
  });
});

describe('getStepWorkflowVariables', () => {
  beforeEach(() => {
    vi.mocked(api.getWorkflowVariables).mockResolvedValue([
      {
        tag: 'patient.age',
        type: 'integer',
        isComputed: false,
        isDynamic: false,
      },
    ]);
    vi.mocked(api.getFormTemplateAsyncV2).mockReset();
  });

  it('returns only global vars when step has no form', async () => {
    const vars = await getStepWorkflowVariables({});
    expect(vars).toEqual([
      expect.objectContaining({ tag: 'patient.age' }),
    ]);
    expect(api.getFormTemplateAsyncV2).not.toHaveBeenCalled();
  });

  it('merges form question vars when step has a formId', async () => {
    vi.mocked(api.getFormTemplateAsyncV2).mockResolvedValue({
      classification: { name: {} },
      version: 1,
      questions: [
        makeQuestion({
          userQuestionId: 'q1',
          questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
          questionText: { English: 'Pregnant?' },
        }),
      ],
    });

    const vars = await getStepWorkflowVariables({ formId: 'form-1' });
    expect(vars.map((v) => v.tag)).toEqual([
      'patient.age',
      'forms[latest].q1',
    ]);
    expect(api.getFormTemplateAsyncV2).toHaveBeenCalledWith('form-1');
  });

  it('falls back to global vars when form fetch fails', async () => {
    vi.mocked(api.getFormTemplateAsyncV2).mockRejectedValue(
      new Error('not found')
    );

    const vars = await getStepWorkflowVariables({ formId: 'missing' });
    expect(vars.map((v) => v.tag)).toEqual(['patient.age']);
  });
});
