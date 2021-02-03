export enum AssessmentField {
  investigation = 'investigation',
  finalDiagnosis = 'finalDiagnosis',
  treatment = 'treatment',
  medication = 'medication',
  followUp = 'followUp',
  followUpInstruc = 'followUpInstruc',
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

  // to-do fetch assessment from server

  return { ...initialState };
}
