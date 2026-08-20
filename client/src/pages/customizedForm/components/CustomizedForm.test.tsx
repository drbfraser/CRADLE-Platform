import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormRenderStateEnum, QuestionTypeEnum } from 'src/shared/enums';
import { CForm } from 'src/shared/types/form/formTypes';
import ProviderWrapper from 'src/testing/ProviderWrapper';
import { CustomizedForm } from './CustomizedForm';

const mutate = vi.fn();
const navigate = vi.fn();

vi.mock('../mutations', () => ({
  useSubmitCustomForm: () => ({
    mutate,
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

const makeForm = (overrides: Partial<CForm> = {}): CForm =>
  ({
    dateCreated: 0,
    category: 'cat',
    id: 'form-1',
    lastEdited: 0,
    version: '1',
    name: 'Test Form',
    lang: 'English',
    patientId: 'patient-1',
    questions: [
      {
        id: 'q-string',
        questionId: 'q-string',
        isBlank: true,
        questionIndex: 0,
        questionText: 'Patient name',
        questionType: QuestionTypeEnum.STRING,
        required: true,
        allowFutureDates: true,
        allowPastDates: true,
        numMin: null,
        numMax: null,
        answers: undefined,
        visibleCondition: [],
        formTemplateId: 'template-1',
        mcOptions: [],
        hasCommentAttached: false,
      },
      {
        id: 'q-mc',
        questionId: 'q-mc',
        isBlank: true,
        questionIndex: 1,
        questionText: 'Severity',
        questionType: QuestionTypeEnum.MULTIPLE_CHOICE,
        required: false,
        allowFutureDates: true,
        allowPastDates: true,
        numMin: null,
        numMax: null,
        answers: undefined,
        visibleCondition: [],
        formTemplateId: 'template-1',
        // Legacy submission shape uses `opt` (not translations).
        mcOptions: [
          { mcId: 0, opt: 'Mild' },
          { mcId: 1, opt: 'Severe' },
        ],
        hasCommentAttached: false,
      },
    ],
    ...overrides,
  }) as CForm;

describe('CustomizedForm', () => {
  beforeEach(() => {
    mutate.mockReset();
    navigate.mockReset();
  });

  it('renders visible question labels including legacy MC option labels', async () => {
    render(
      <CustomizedForm
        patientId="patient-1"
        fm={makeForm()}
        renderState={FormRenderStateEnum.FIRST_SUBMIT}
      />,
      { wrapper: ProviderWrapper }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Patient name/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByLabelText('Mild')).toBeInTheDocument();
    expect(screen.getByLabelText('Severe')).toBeInTheDocument();
  });

  it('calls customSubmitHandler with a create payload on submit', async () => {
    const user = userEvent.setup();
    const customSubmitHandler = vi.fn();

    render(
      <CustomizedForm
        patientId="patient-1"
        fm={makeForm()}
        renderState={FormRenderStateEnum.FIRST_SUBMIT}
        customSubmitHandler={customSubmitHandler}
      />,
      { wrapper: ProviderWrapper }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Patient name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Patient name/i), 'Ada');
    await user.click(screen.getByRole('button', { name: 'Submit Form' }));

    await waitFor(() => {
      expect(customSubmitHandler).toHaveBeenCalled();
    });

    const [, postBody] = customSubmitHandler.mock.calls[0];
    expect(postBody.create).toBeDefined();
    expect(postBody.create.patientId).toBe('patient-1');
    expect(postBody.edit).toBeUndefined();
  });

  it('blocks submit for required empty multi-select and shows validation', async () => {
    const user = userEvent.setup();
    const customSubmitHandler = vi.fn();
    const form = makeForm({
      questions: [
        {
          id: 'q-ms',
          questionId: 'q-ms',
          isBlank: true,
          questionIndex: 0,
          questionText: 'Symptoms',
          questionType: QuestionTypeEnum.MULTIPLE_SELECT,
          required: true,
          allowFutureDates: true,
          allowPastDates: true,
          numMin: null,
          numMax: null,
          answers: undefined,
          visibleCondition: [],
          formTemplateId: 'template-1',
          mcOptions: [
            { mcId: 0, opt: 'Headache' },
            { mcId: 1, opt: 'Fever' },
          ],
          hasCommentAttached: false,
        },
      ],
    });

    render(
      <CustomizedForm
        patientId="patient-1"
        fm={form}
        renderState={FormRenderStateEnum.EDIT}
        customSubmitHandler={customSubmitHandler}
      />,
      { wrapper: ProviderWrapper }
    );

    await waitFor(() => {
      expect(screen.getByText(/Symptoms/)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Update Form' }));

    expect(customSubmitHandler).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.getByText('(Must Select At Least One Option !)')
      ).toBeInTheDocument();
    });
  });

  it('pre-fills answers in edit mode', async () => {
    const form = makeForm({
      questions: [
        {
          id: 'ans-1',
          questionId: 'q-string',
          isBlank: false,
          questionIndex: 0,
          questionText: 'Patient name',
          questionType: QuestionTypeEnum.STRING,
          required: true,
          allowFutureDates: true,
          allowPastDates: true,
          numMin: null,
          numMax: null,
          answers: { text: 'Grace' },
          visibleCondition: [],
          formTemplateId: 'template-1',
          mcOptions: [],
          hasCommentAttached: false,
        },
      ],
    });

    render(
      <CustomizedForm
        patientId="patient-1"
        fm={form}
        renderState={FormRenderStateEnum.EDIT}
      />,
      { wrapper: ProviderWrapper }
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Grace')).toBeInTheDocument();
    });
  });

  it('disables all inputs in VIEW mode', async () => {
    render(
      <CustomizedForm
        patientId="patient-1"
        fm={makeForm()}
        renderState={FormRenderStateEnum.VIEW}
        isFormModal
      />,
      { wrapper: ProviderWrapper }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Patient name/i)).toBeDisabled();
    });
    expect(screen.getByLabelText('Mild')).toBeDisabled();
    expect(screen.getByLabelText('Severe')).toBeDisabled();
  });
});
