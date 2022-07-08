import { FormikProps } from 'formik';
import { getPatientMedicalHistoryAsync } from 'src/shared/api';

export enum ReadingField {
  // symptoms
  headache = 'headache',
  blurredVision = 'blurredVision',
  abdominalPain = 'abdominalPain',
  bleeding = 'bleeding',
  feverish = 'feverish',
  unwell = 'unwell',
  cough = 'cough',
  shortnessOfBreath = 'shortnessOfBreath',
  soreThroat = 'soreThroat',
  muscleAche = 'muscleAche',
  fatigue = 'fatigue',
  lossOfSense = 'lossOfSense',
  lossOfTaste = 'lossOfTaste',
  lossOfSmell = 'lossOfSmell',
  otherSymptoms = 'otherSymptoms',
  // vital signs
  bpSystolic = 'bpSystolic',
  bpDiastolic = 'bpDiastolic',
  heartRateBPM = 'heartRateBPM',
  // urine test
  urineTest = 'urineTest',
  leukocytes = 'leukocytes',
  nitrites = 'nitrites',
  glucose = 'glucose',
  protein = 'protein',
  blood = 'blood',
  // assessment
  investigation = 'investigation',
  finalDiagnosis = 'finalDiagnosis',
  treatment = 'treatment',
  medication = 'medication',
  followUp = 'followUp',
  followUpInstruc = 'followUpInstruc',
  drugHistory = 'drugHistory',
}

export const initialState = {
  // symptoms
  [ReadingField.headache]: false,
  [ReadingField.blurredVision]: false,
  [ReadingField.abdominalPain]: false,
  [ReadingField.bleeding]: false,
  [ReadingField.feverish]: false,
  [ReadingField.unwell]: false,
  [ReadingField.cough]: false,
  [ReadingField.shortnessOfBreath]: false,
  [ReadingField.soreThroat]: false,
  [ReadingField.muscleAche]: false,
  [ReadingField.fatigue]: false,
  [ReadingField.lossOfSense]: false,
  [ReadingField.lossOfTaste]: false,
  [ReadingField.lossOfSmell]: false,
  [ReadingField.otherSymptoms]: '',
  // vital signs
  [ReadingField.bpSystolic]: '',
  [ReadingField.bpDiastolic]: '',
  [ReadingField.heartRateBPM]: '',
  // urine test
  [ReadingField.urineTest]: false,
  [ReadingField.leukocytes]: '',
  [ReadingField.nitrites]: '',
  [ReadingField.glucose]: '',
  [ReadingField.protein]: '',
  [ReadingField.blood]: '',
  // assessment
  [ReadingField.investigation]: '',
  [ReadingField.finalDiagnosis]: '',
  [ReadingField.treatment]: '',
  [ReadingField.medication]: '',
  [ReadingField.followUp]: false,
  [ReadingField.followUpInstruc]: '',
  [ReadingField.drugHistory]: '',
};

export type ReadingState = typeof initialState;

export const getReadingState = async (
  patientId: string
): Promise<ReadingState> => {
  const medicalHistory = await getPatientMedicalHistoryAsync(patientId);

  return {
    ...initialState,
    [ReadingField.drugHistory]: medicalHistory.drugHistory!,
  };
};

export interface FormPageProps {
  formikProps: FormikProps<ReadingState>;
}
