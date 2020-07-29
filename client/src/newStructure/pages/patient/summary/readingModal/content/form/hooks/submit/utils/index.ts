import { SymptomEnum } from '../../../../../../../../../enums';

export const formatSymptoms = (
  selectedSymptoms: Record<SymptomEnum, boolean>,
  otherSymptoms: string
): Array<string> => {
  // * Get all selected symptoms
  const symptoms = Object.entries(selectedSymptoms).reduce(
    (
      symptoms: Array<SymptomEnum>,
      [symptom, selected]: [SymptomEnum, boolean]
    ): Array<SymptomEnum> => {
      if (symptom === SymptomEnum.OTHER) {
        return symptoms;
      }

      if (selected) {
        return [...symptoms, symptom];
      }

      return symptoms;
    },
    []
  );

  if (symptoms.includes(SymptomEnum.NONE)) {
    // * If none selected return nothing
    return [];
  }

  return [
    ...symptoms,
    ...(selectedSymptoms[SymptomEnum.OTHER] ? [otherSymptoms] : []),
  ];
};
