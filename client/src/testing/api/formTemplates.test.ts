import { describe, it, expect } from 'vitest';
import { buildFormTemplatePayload } from 'src/pages/customizedForm/components/SubmitFormTemplateDialog';
import { QuestionTypeEnum } from 'src/shared/enums';

describe('buildFormTemplatePayload', () => {
  it('remaps questionIndex and strips extraneous fields', () => {
    const payload = buildFormTemplatePayload({
      classification: { name: 'x', id: 'c1' },
      version: '2025-01-01',
      questions: [
        {
          id: 'q1',
          questionIndex: 99,
          questionType: QuestionTypeEnum.STRING,
          required: true,
          visibleCondition: [],
          langVersions: [{ lang: 'en', questionText: 'Hello', mcOptions: [] }],
          extra_runtime_field: 'should_be_dropped' as any,
        },
      ],
    });

    // ensures it rewrites index
    expect(payload.questions[0].questionIndex).toBe(0);

    // ensures no random fields sent
    expect(payload.questions[0]).not.toHaveProperty('extra_runtime_field');
  });

  it('strips extraneous fields from langVersions', () => {
    const payload = buildFormTemplatePayload({
      classification: { name: 'x', id: 'c1' },
      version: 'v1',
      questions: [
        {
          id: 'q1',
          questionIndex: 0,
          questionType: QuestionTypeEnum.STRING,
          required: true,
          visibleCondition: [],
          langVersions: [
            {
              lang: 'en',
              questionText: 'Hi',
              mcOptions: [],
              foo: 'bar' as any,
            },
          ],
        },
      ],
    });

    expect(payload.questions[0].langVersions[0]).not.toHaveProperty('foo');
  });

  it('includes required top-level props', () => {
    const payload = buildFormTemplatePayload({
      classification: { id: 'c1', name: 'x' },
      version: 'v1',
      questions: [],
    });

    expect(payload).toMatchObject({
      classification: { id: 'c1', name: 'x' },
      version: 'v1',
      questions: [],
    });
  });
});
