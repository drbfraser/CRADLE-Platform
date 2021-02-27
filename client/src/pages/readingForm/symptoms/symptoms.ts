import { ReadingField, ReadingState } from '../state';

export const symptomNames = {
  [ReadingField.headache]: 'Headache',
  [ReadingField.blurredVision]: 'Blurred vision',
  [ReadingField.abdominalPain]: 'Abdominal pain',
  [ReadingField.bleeding]: 'Bleeding',
  [ReadingField.feverish]: 'Feverish',
  [ReadingField.unwell]: 'Unwell',
  [ReadingField.fatigue]: 'Fatigue',
  [ReadingField.cough]: 'Cough',
  [ReadingField.shortnessOfBreath]: 'Shortness of breath',
  [ReadingField.soreThroat]: 'Sore throat',
  [ReadingField.muscleAche]: 'Muscle ache',
  [ReadingField.lossOfSense]: 'Loss of sense',
  [ReadingField.lossOfTaste]: 'Loss of taste',
  [ReadingField.lossOfSmell]: 'Loss of smell',
};

export const getSymptomsFromFormState = (
  state: ReadingState,
  includeOtherSymptoms = false
) => {
  const symptoms = Object.entries(symptomNames)
    .filter(([field]) => state[field as ReadingField])
    .map(([_, name]) => name);

  if (includeOtherSymptoms && state[ReadingField.otherSymptoms].length !== 0) {
    symptoms.push(state[ReadingField.otherSymptoms]);
  }

  return symptoms;
};
