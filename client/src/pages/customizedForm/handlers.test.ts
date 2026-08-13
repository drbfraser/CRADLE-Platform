import { describe, it, expect } from 'vitest';
import { QuestionTypeEnum } from 'src/shared/enums';
import { CForm, QAnswer, Question } from 'src/shared/types/form/formTypes';
import {
  TransferQAnswerToAPIStandard,
  TransferQAnswerToPostBody,
  areMcResponsesValid,
  areNumberResponsesValid,
  ApiAnswer,
} from './handlers';

const makeQuestion = (overrides: Partial<Question> & { questionIndex: number }): Question =>
  ({
    id: `id-${overrides.questionIndex}`,
    questionId: `qid-${overrides.questionIndex}`,
    isBlank: true,
    questionText: `Question ${overrides.questionIndex}`,
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

const makeAnswer = (overrides: Partial<QAnswer> & { questionIndex: number }): QAnswer => ({
  questionType: QuestionTypeEnum.STRING,
  answerType: null,
  val: null,
  ...overrides,
});

describe('TransferQAnswerToAPIStandard', () => {
  it('maps string answers to { text }', () => {
    const questions = [makeQuestion({ questionIndex: 0, questionType: QuestionTypeEnum.STRING })];
    const answers = [makeAnswer({ questionIndex: 0, questionType: QuestionTypeEnum.STRING, val: 'hello' })];

    expect(TransferQAnswerToAPIStandard(answers, questions)).toEqual([
      { qidx: 0, answer: { text: 'hello' } },
    ]);
  });

  it('maps integer answers to { number }', () => {
    const questions = [makeQuestion({ questionIndex: 1, questionType: QuestionTypeEnum.INTEGER })];
    const answers = [makeAnswer({ questionIndex: 1, questionType: QuestionTypeEnum.INTEGER, val: 90 })];

    expect(TransferQAnswerToAPIStandard(answers, questions)).toEqual([
      { qidx: 1, answer: { number: 90 } },
    ]);
  });

  it('maps MC labels to option indices', () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        mcOptions: [
          { mcId: 0, opt: 'Option A' },
          { mcId: 1, opt: 'Option B' },
        ],
      }),
    ];
    const answers = [
      makeAnswer({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        val: ['Option A'],
      }),
    ];

    expect(TransferQAnswerToAPIStandard(answers, questions)).toEqual([
      { qidx: 0, answer: { mcIdArray: [0] } },
    ]);
  });

  it('maps translated MC option labels to indices', () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_SELECT,
        mcOptions: [
          { translations: { english: 'Yes', french: 'Oui' } } as any,
          { translations: { english: 'No', french: 'Non' } } as any,
        ],
      }),
    ];
    const answers = [
      makeAnswer({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_SELECT,
        val: ['Yes', 'No'],
      }),
    ];

    expect(TransferQAnswerToAPIStandard(answers, questions)).toEqual([
      { qidx: 0, answer: { mcIdArray: [0, 1] } },
    ]);
  });

  it('drops unknown MC labels instead of sending -1 indices', () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        mcOptions: [{ mcId: 0, opt: 'Option A' }],
      }),
    ];
    const answers = [
      makeAnswer({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        val: ['Option A', 'Not A Real Option'],
      }),
    ];

    expect(TransferQAnswerToAPIStandard(answers, questions)).toEqual([
      { qidx: 0, answer: { mcIdArray: [0] } },
    ]);
  });

  it('excludes CATEGORY questions from the API payload', () => {
    const questions = [
      makeQuestion({ questionIndex: 0, questionType: QuestionTypeEnum.CATEGORY }),
      makeQuestion({ questionIndex: 1, questionType: QuestionTypeEnum.STRING }),
    ];
    const answers = [
      makeAnswer({ questionIndex: 0, questionType: QuestionTypeEnum.CATEGORY, val: null }),
      makeAnswer({ questionIndex: 1, questionType: QuestionTypeEnum.STRING, val: 'keep me' }),
    ];

    expect(TransferQAnswerToAPIStandard(answers, questions)).toEqual([
      { qidx: 1, answer: { text: 'keep me' } },
    ]);
  });

  it('excludes answers whose questionType is not a supported field type', () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: 'NOT_A_REAL_TYPE' as QuestionTypeEnum,
      }),
      makeQuestion({ questionIndex: 1, questionType: QuestionTypeEnum.INTEGER }),
    ];
    const answers = [
      makeAnswer({ questionIndex: 0, val: 'x' }),
      makeAnswer({ questionIndex: 1, questionType: QuestionTypeEnum.INTEGER, val: 3 }),
    ];

    expect(TransferQAnswerToAPIStandard(answers, questions)).toEqual([
      { qidx: 1, answer: { number: 3 } },
    ]);
  });

  it('returns an empty list when there are no answers', () => {
    expect(TransferQAnswerToAPIStandard([], [makeQuestion({ questionIndex: 0 })])).toEqual([]);
  });
});

describe('TransferQAnswerToPostBody', () => {
  const form: CForm = {
    dateCreated: 0,
    category: 'cat',
    id: 'form-1',
    lastEdited: 0,
    version: '3',
    name: 'Test Form',
    lang: 'English',
    patientId: undefined,
    questions: [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.STRING,
        id: 'ans-row-0',
        questionId: 'q-0',
      }),
      makeQuestion({
        questionIndex: 1,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        id: 'ans-row-1',
        questionId: 'q-1',
        required: true,
        mcOptions: [
          { mcId: 0, opt: 'A' },
          { mcId: 1, opt: 'B' },
        ],
      }),
      makeQuestion({
        questionIndex: 2,
        questionType: QuestionTypeEnum.INTEGER,
        id: 'ans-row-2',
        questionId: 'q-2',
        numMin: 0,
        numMax: 300,
      }),
    ],
  };

  it('builds create payload: strips version, sets patientId, computes isBlank', () => {
    const apiAnswers: ApiAnswer[] = [
      { qidx: 0, answer: { text: 'hello' } },
      { qidx: 1, answer: { mcIdArray: [0] } },
      { qidx: 2, answer: { number: 90 } },
    ];

    const body = TransferQAnswerToPostBody(apiAnswers, form, 'patient-9', false);

    expect(body.edit).toBeUndefined();
    expect(body.create).toBeDefined();
    expect(body.create!.version).toBeUndefined();
    expect(body.create!.patientId).toBe('patient-9');
    expect(body.create!.questions).toHaveLength(3);
    expect(body.create!.questions[0].isBlank).toBe(false);
    expect(body.create!.questions[0].answers).toEqual({ text: 'hello' });
    expect(body.create!.questions[1].isBlank).toBe(false);
    expect(body.create!.questions[2].isBlank).toBe(false);
    expect(body.create!.questions[2].shouldHidden).toBeUndefined();
  });

  it('treats integer 0 as a real answer (isBlank false), not empty', () => {
    const apiAnswers: ApiAnswer[] = [{ qidx: 2, answer: { number: 0 } }];

    const body = TransferQAnswerToPostBody(apiAnswers, form, 'patient-9', false);

    expect(body.create!.questions[0].isBlank).toBe(false);
    expect(body.create!.questions[0].answers).toEqual({ number: 0 });
  });

  it('marks required empty MC as isBlank true in create mode', () => {
    const apiAnswers: ApiAnswer[] = [{ qidx: 1, answer: { mcIdArray: [] } }];

    const body = TransferQAnswerToPostBody(apiAnswers, form, 'patient-9', false);

    expect(body.create!.questions[0].isBlank).toBe(true);
  });

  it('builds edit payload with id and questionId per answer', () => {
    const apiAnswers: ApiAnswer[] = [
      { qidx: 0, answer: { text: 'updated' } },
      { qidx: 2, answer: { number: 120 } },
    ];

    const body = TransferQAnswerToPostBody(apiAnswers, form, 'patient-9', true);

    expect(body.create).toBeUndefined();
    expect(body.edit).toEqual([
      {
        id: 'ans-row-0',
        questionId: 'q-0',
        answers: { text: 'updated' },
        questionType: QuestionTypeEnum.STRING,
      },
      {
        id: 'ans-row-2',
        questionId: 'q-2',
        answers: { number: 120 },
        questionType: QuestionTypeEnum.INTEGER,
      },
    ]);
  });
});

describe('areMcResponsesValid', () => {
  it('skips required hidden MC questions', () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        required: true,
        shouldHidden: true,
        mcOptions: [{ mcId: 0, opt: 'A' }],
      }),
    ];
    const answers = [
      makeAnswer({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        val: [],
      }),
    ];

    expect(areMcResponsesValid(questions, answers)).toBe(true);
  });

  it('rejects required visible MC with empty selection', () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_SELECT,
        required: true,
        shouldHidden: false,
        mcOptions: [{ mcId: 0, opt: 'A' }],
      }),
    ];
    const answers = [
      makeAnswer({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_SELECT,
        val: [],
      }),
    ];

    expect(areMcResponsesValid(questions, answers)).toBe(false);
  });

  it('allows optional empty MC selection', () => {
    const questions = [
      makeQuestion({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        required: false,
        shouldHidden: false,
        mcOptions: [{ mcId: 0, opt: 'A' }],
      }),
    ];
    const answers = [
      makeAnswer({
        questionIndex: 0,
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        val: [],
      }),
    ];

    expect(areMcResponsesValid(questions, answers)).toBe(true);
  });
});

describe('areNumberResponsesValid', () => {
  const ranged = [
    makeQuestion({
      questionIndex: 0,
      questionType: QuestionTypeEnum.INTEGER,
      numMin: 0,
      numMax: 300,
    }),
  ];

  it('accepts values within range', () => {
    expect(
      areNumberResponsesValid(ranged, [
        makeAnswer({ questionIndex: 0, questionType: QuestionTypeEnum.INTEGER, val: 90 }),
      ])
    ).toBe(true);
  });

  it('accepts exact min and max boundaries', () => {
    expect(
      areNumberResponsesValid(ranged, [
        makeAnswer({ questionIndex: 0, questionType: QuestionTypeEnum.INTEGER, val: 0 }),
      ])
    ).toBe(true);
    expect(
      areNumberResponsesValid(ranged, [
        makeAnswer({ questionIndex: 0, questionType: QuestionTypeEnum.INTEGER, val: 300 }),
      ])
    ).toBe(true);
  });

  it('rejects values below min', () => {
    expect(
      areNumberResponsesValid(ranged, [
        makeAnswer({ questionIndex: 0, questionType: QuestionTypeEnum.INTEGER, val: -1 }),
      ])
    ).toBe(false);
  });

  it('rejects values above max', () => {
    expect(
      areNumberResponsesValid(ranged, [
        makeAnswer({ questionIndex: 0, questionType: QuestionTypeEnum.INTEGER, val: 500 }),
      ])
    ).toBe(false);
  });

  it('rejects non-numeric values when a range is configured', () => {
    expect(
      areNumberResponsesValid(ranged, [
        makeAnswer({ questionIndex: 0, questionType: QuestionTypeEnum.INTEGER, val: 'abc' }),
      ])
    ).toBe(false);
  });

  it('ignores non-numeric question types', () => {
    const questions = [makeQuestion({ questionIndex: 0, questionType: QuestionTypeEnum.STRING })];
    expect(
      areNumberResponsesValid(questions, [
        makeAnswer({ questionIndex: 0, questionType: QuestionTypeEnum.STRING, val: 'hello' }),
      ])
    ).toBe(true);
  });
});
