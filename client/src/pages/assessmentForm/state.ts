import { getAssessmentAsync, getDrugHistoryAsync } from 'src/shared/api';

// field names here match /api/assessments
export enum AssessmentField {
  investigation = 'specialInvestigations',
  finalDiagnosis = 'diagnosis',
  treatment = 'treatment',
  medication = 'medicationPrescribed',
  followUp = 'followupNeeded',
  followUpInstruc = 'followupInstructions',
  drugHistory = 'drugHistory',
}

export const initialState = {
  [AssessmentField.investigation]: '',
  [AssessmentField.finalDiagnosis]: '',
  [AssessmentField.treatment]: '',
  [AssessmentField.followUp]: false,
  [AssessmentField.followUpInstruc]: '',
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
