import { describe, it, expect } from 'vitest';
import { buildFormTemplatePayload } from 'src/pages/customizedForm/components/SubmitFormTemplateDialog';
import { QuestionTypeEnum } from 'src/shared/enums';

describe('buildFormTemplatePayload', () => {
  it('maps questions with sequential questionIndex and injects formTemplateId', () => {
    const payload = buildFormTemplatePayload({
      id: 'form-1',
      classification: { id: 'c1', name: { en: 'Test' } },
      version: 'v1',
      questions: [
        {
          id: 'q1',
          order: 10,
          questionType: QuestionTypeEnum.STRING,
          required: true,
          allowPastDates: false,
          allowFutureDates: true,
          categoryIndex: 0,
          units: null,
          numMin: null,
          numMax: null,
          stringMaxLength: 100,
          stringMaxLines: 1,
          visibleCondition: [],
          questionText: { en: 'Hello' },
          mcOptions: [],
          hasCommentAttached: false,
          questionStringId: 'qs1',
          userQuestionId: 'uq1',
        },
      ],
    } as any);

    expect(payload.questions[0]).toMatchObject({
      id: 'q1',
      order: 10,
      isBlank: true,
      formTemplateId: 'form-1',
    });
  });

  it('drops extraneous fields from questions', () => {
    const payload = buildFormTemplatePayload({
      id: 'form-1',
      classification: { id: 'c1', name: { en: 'Test' } },
      version: 'v1',
      questions: [
        {
          id: 'q1',
          order: 0,
          questionType: QuestionTypeEnum.STRING,
          required: true,
          visibleCondition: [],
          questionText: { en: 'Hi' },
          foo: 'bar',
          runtimeOnly: true,
        },
      ],
    } as any);

    expect(payload.questions[0]).not.toHaveProperty('foo');
    expect(payload.questions[0]).not.toHaveProperty('runtimeOnly');
  });

  it('applies defaults for optional fields', () => {
    const payload = buildFormTemplatePayload({
      id: 'form-1',
      classification: { id: 'c1', name: { en: 'Test' } },
      version: 'v1',
      questions: [
        {
          id: 'q1',
          order: 0,
          questionType: QuestionTypeEnum.STRING,
          required: false,
        },
      ],
    } as any);

    expect(payload.questions[0]).toMatchObject({
      visibleCondition: [],
      questionText: {},
      mcOptions: [],
      isBlank: true,
    });
  });

  it('includes required top-level fields', () => {
    const payload = buildFormTemplatePayload({
      id: 'form-1',
      classification: { id: 'c1', name: { en: 'Name' } },
      version: 1,
      questions: [],
    });

    expect(payload).toEqual({
      id: 'form-1',
      classification: { id: 'c1', name: { en: 'Name' } },
      version: 1,
      questions: [],
    });
  });
});
