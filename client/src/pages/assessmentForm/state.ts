import { apiFetch } from '../../../src/shared/utils/api';
import { EndpointEnum } from '../../../src/server';
import { BASE_URL } from '../../../src/server/utils';

// field names here match /api/assessments
export enum AssessmentField {
  investigation = 'specialInvestigations',
  finalDiagnosis = 'diagnosis',
  treatment = 'treatment',
  medication = 'medicationPrescribed',
  followUp = 'followupNeeded',
  followUpInstruc = 'followupInstructions',
}

export const initialState = {
  [AssessmentField.investigation]: '',
  [AssessmentField.finalDiagnosis]: '',
  [AssessmentField.treatment]: '',
  [AssessmentField.medication]: '',
  [AssessmentField.followUp]: false,
  [AssessmentField.followUpInstruc]: '',
};

export type AssessmentState = typeof initialState;

export const getAssessmentState = async (
  assessmentId: string | undefined
): Promise<AssessmentState> => {
  if (assessmentId === undefined) {
    return { ...initialState };
  }

  const resp = await apiFetch(
    BASE_URL + EndpointEnum.ASSESSMENTS + '/' + assessmentId
  );

  const state = await resp.json();

  return state;
};
