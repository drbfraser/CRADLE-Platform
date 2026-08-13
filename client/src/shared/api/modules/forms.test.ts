import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mockServer } from 'src/testing/mockServer';
import { API_URL } from 'src/shared/api/core/http';
import { EndpointEnum, QuestionTypeEnum, UserRoleEnum } from 'src/shared/enums';
import { PostBody } from 'src/pages/customizedForm/handlers';

const { mockGetState } = vi.hoisted(() => ({
  mockGetState: vi.fn(() => ({
    user: {
      current: {
        id: 42,
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        healthFacilityName: 'HF',
        role: 'ADMIN',
        smsKey: null,
        supervises: [],
        phoneNumbers: [],
      },
    },
  })),
}));

vi.mock('src/redux/store', () => ({
  reduxStore: {
    getState: mockGetState,
    dispatch: vi.fn(),
  },
}));

import {
  saveFormResponseAsync,
  getFormResponseAsync,
} from 'src/shared/api/modules/forms';

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: () =>
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTksInVzZXJuYW1lIjoidGVzdHVzZXIifQ.test',
    setItem: () => {},
    removeItem: () => {},
  },
  writable: true,
});

const FORM_SUBMISSIONS_V2 = `${API_URL}/forms/v2/submissions`;

const CURRENT_USER = {
  id: 42,
  username: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  healthFacilityName: 'HF',
  role: UserRoleEnum.ADMIN,
  smsKey: null,
  supervises: [],
  phoneNumbers: ['+15555550100'],
};

describe('forms API', () => {
  beforeEach(() => {
    mockServer.resetHandlers();
    mockGetState.mockReturnValue({
      user: { current: CURRENT_USER },
    });
    // Fallback if store user is missing — still keep create tests offline.
    mockServer.use(
      http.get(API_URL + EndpointEnum.USER_CURRENT, () =>
        HttpResponse.json(CURRENT_USER, { status: 200 })
      )
    );
  });

  describe('saveFormResponseAsync', () => {
    it('POSTs a create payload to /forms/v2/submissions', async () => {
      let captured: unknown;

      mockServer.use(
        http.post(FORM_SUBMISSIONS_V2, async ({ request }) => {
          captured = await request.json();
          return HttpResponse.json({ id: 'sub-1' }, { status: 201 });
        })
      );

      const postBody: PostBody = {
        create: {
          dateCreated: 0,
          category: 'cat',
          id: 'template-1',
          lastEdited: 0,
          version: undefined,
          name: 'Form',
          lang: 'English',
          patientId: 'patient-1',
          questions: [
            {
              id: 'q1',
              isBlank: false,
              questionIndex: 0,
              questionText: 'Age',
              questionType: QuestionTypeEnum.INTEGER,
              required: true,
              allowFutureDates: true,
              allowPastDates: true,
              numMin: 0,
              numMax: 120,
              answers: { number: 30 },
              visibleCondition: [],
              formTemplateId: 'template-1',
              mcOptions: [],
              hasCommentAttached: false,
            },
          ],
        },
        edit: undefined,
      };

      await saveFormResponseAsync(postBody);

      expect(captured).toEqual({
        formTemplateId: 'template-1',
        patientId: 'patient-1',
        userId: 42,
        lang: 'English',
        answers: [
          {
            questionId: 'q1',
            answer: { number: 30, comment: undefined },
          },
        ],
      });
    });

    it('PATCHes edit answers when formId is provided', async () => {
      let captured: unknown;

      mockServer.use(
        http.patch(`${FORM_SUBMISSIONS_V2}/sub-9`, async ({ request }) => {
          captured = await request.json();
          return HttpResponse.json({ id: 'sub-9' }, { status: 200 });
        })
      );

      const postBody: PostBody = {
        create: undefined,
        edit: [
          {
            id: 'ans-1',
            questionId: 'q1',
            answers: { text: 'updated' },
            questionType: QuestionTypeEnum.STRING,
          },
          {
            // empty answer should be filtered out
            id: 'ans-2',
            questionId: 'q2',
            answers: { text: '' },
            questionType: QuestionTypeEnum.STRING,
          },
        ],
      };

      await saveFormResponseAsync(postBody, 'sub-9');

      expect(captured).toEqual({
        answers: [
          {
            id: 'ans-1',
            questionId: 'q1',
            answer: { text: 'updated', comment: undefined },
          },
        ],
      });
    });

    it('throws when create payload is missing', async () => {
      await expect(
        saveFormResponseAsync({ create: undefined, edit: undefined })
      ).rejects.toThrow('Missing form payload for submission.');
    });
  });

  describe('getFormResponseAsync', () => {
    it('merges template questions with submission answers', async () => {
      mockServer.use(
        http.get(`${FORM_SUBMISSIONS_V2}/sub-1`, () =>
          HttpResponse.json({
            id: 'sub-1',
            formTemplateId: 'template-1',
            patientId: 'patient-1',
            dateSubmitted: 1000,
            lastEdited: 2000,
            lang: 'English',
            answers: [
              {
                id: 'ans-1',
                questionId: 'q1',
                answer: { number: 80 },
              },
              {
                id: 'ans-2',
                questionId: 'q2',
                answer: { mcIdArray: [1] },
              },
            ],
          })
        ),
        http.get(`${API_URL}${EndpointEnum.FORM_TEMPLATES_V2}/template-1`, () =>
          HttpResponse.json({
            id: 'template-1',
            version: 2,
            classification: { name: { english: 'Vitals' } },
            questions: [
              {
                id: 'q1',
                order: 0,
                questionType: QuestionTypeEnum.INTEGER,
                questionText: { english: 'Systolic' },
                required: true,
                formTemplateId: 'template-1',
              },
              {
                id: 'q2',
                order: 1,
                questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
                questionText: { english: 'Severity' },
                required: false,
                formTemplateId: 'template-1',
                mcOptions: [
                  { translations: { english: 'Mild' } },
                  { translations: { english: 'Severe' } },
                ],
              },
            ],
          })
        )
      );

      const form = await getFormResponseAsync('sub-1');

      expect(form.id).toBe('sub-1');
      expect(form.patientId).toBe('patient-1');
      expect(form.name).toBe('Vitals');
      expect(form.version).toBe('2');
      expect(form.questions).toHaveLength(2);

      expect(form.questions[0]).toMatchObject({
        id: 'ans-1',
        questionId: 'q1',
        questionText: 'Systolic',
        questionIndex: 0,
        answers: { number: 80 },
        isBlank: false,
      });

      expect(form.questions[1]).toMatchObject({
        id: 'ans-2',
        questionId: 'q2',
        questionText: 'Severity',
        answers: { mcIdArray: [1] },
        mcOptions: [
          { mcId: 0, opt: 'Mild' },
          { mcId: 1, opt: 'Severe' },
        ],
      });
    });

    it('resolves MC option labels from template indices for the UI', async () => {
      mockServer.use(
        http.get(`${FORM_SUBMISSIONS_V2}/sub-2`, () =>
          HttpResponse.json({
            id: 'sub-2',
            formTemplateId: 'template-2',
            patientId: 'patient-1',
            dateSubmitted: 1,
            lastEdited: 1,
            lang: 'English',
            answers: [
              {
                id: 'ans-mc',
                questionId: 'q-mc',
                answer: { mcIdArray: [0, 2] },
              },
            ],
          })
        ),
        http.get(`${API_URL}${EndpointEnum.FORM_TEMPLATES_V2}/template-2`, () =>
          HttpResponse.json({
            id: 'template-2',
            version: 1,
            classification: { name: 'Survey' },
            questions: [
              {
                id: 'q-mc',
                order: 0,
                questionType: QuestionTypeEnum.MULTIPLE_SELECT,
                questionText: 'Symptoms',
                required: false,
                mcOptions: [
                  { translations: { english: 'Headache' } },
                  { translations: { english: 'Fever' } },
                  { translations: { english: 'Cough' } },
                ],
              },
            ],
          })
        )
      );

      const form = await getFormResponseAsync('sub-2');

      expect(form.questions[0].mcOptions.map((o) => o.opt)).toEqual([
        'Headache',
        'Fever',
        'Cough',
      ]);
      expect(form.questions[0].answers?.mcIdArray).toEqual([0, 2]);
    });
  });
});
