import { getAssessmentAsync, getDrugHistoryAsync } from 'src/shared/api';

// field names here match /api/assessments
export enum AssessmentField {
  investigation = 'specialInvestigations',
  finalDiagnosis = 'diagnosis',
  treatment = 'treatment',
  medication = 'medicationPrescribed',
  followUp = 'followUpNeeded',
  followUpInstructions = 'followUpInstructions',
  drugHistory = 'drugHistory',
  healthcareWorkerId = 'healthcareWorkerId',
}

const initialState = {
  [AssessmentField.investigation]: '',
  [AssessmentField.finalDiagnosis]: '',
  [AssessmentField.treatment]: '',
  [AssessmentField.followUp]: false,
  [AssessmentField.followUpInstructions]: '',
  [AssessmentField.drugHistory]: '',
  [AssessmentField.healthcareWorkerId]: null,
};

export type AssessmentState = typeof initialState & {
  [AssessmentField.healthcareWorkerId]: number | null;
};

export const getAssessmentState = async (
  patientId: string,
  assessmentId: string | undefined
): Promise<AssessmentState> => {
  initialState[AssessmentField.drugHistory] = 
    await getDrugHistoryAsync(patientId);

  if (assessmentId === undefined) {
    return { ...initialState };
  }

  const state: AssessmentState = await getAssessmentAsync(assessmentId);
  state[AssessmentField.drugHistory] =
    initialState[AssessmentField.drugHistory];

  return state;
};
