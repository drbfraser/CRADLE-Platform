import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';

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
  await apiFetch(
    API_URL +
      EndpointEnum.PATIENTS +
      `/${patientId}` +
      EndpointEnum.MEDICAL_HISTORY
  )
    .then((resp) => resp.json())
    .then(
      (info) => (initialState[AssessmentField.drugHistory] = info.drugHistory)
    );

  if (assessmentId === undefined) {
    return { ...initialState };
  }

  const resp = await apiFetch(
    API_URL + EndpointEnum.ASSESSMENTS + '/' + assessmentId
  );

  const state = await resp.json();
  state[AssessmentField.drugHistory] =
    initialState[AssessmentField.drugHistory];

  return state;
};
