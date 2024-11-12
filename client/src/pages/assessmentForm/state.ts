import { getAssessmentAsync, getDrugHistoryAsync } from 'src/shared/api/api';

// field names here match /api/assessments
export enum AssessmentField {
  investigation = 'specialInvestigations',
  finalDiagnosis = 'diagnosis',
  treatment = 'treatment',
  medication = 'medicationPrescribed',
  followUp = 'followUpNeeded',
  followUpInstructions = 'followUpInstructions',
  drugHistory = 'drugHistory',
}

export const initialState = {
  [AssessmentField.investigation]: '',
  [AssessmentField.finalDiagnosis]: '',
  [AssessmentField.treatment]: '',
  [AssessmentField.followUp]: false,
  [AssessmentField.followUpInstructions]: '',
  [AssessmentField.drugHistory]: '',
};

export type AssessmentState = typeof initialState;

export const getAssessmentState = async (
  patientId: string,
  assessmentId: string | undefined
): Promise<AssessmentState> => {
  initialState[AssessmentField.drugHistory] = await getDrugHistoryAsync(
    patientId
  );

  if (assessmentId === undefined) {
    return { ...initialState };
  }

  const state: AssessmentState = await getAssessmentAsync(assessmentId);
  state[AssessmentField.drugHistory] =
    initialState[AssessmentField.drugHistory];

  return state;
};
