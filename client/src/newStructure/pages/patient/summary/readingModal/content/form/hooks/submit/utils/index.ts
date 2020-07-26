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

  return (
    symptoms
      .map((symptom: SymptomEnum): string =>
        symptom
          // * Remove all starting and ending whitespace from symptom
          .trim()
          // * Make symptom lowercase
          .toLowerCase()
          // * Make symptom camelCase
          .replace(
            /[a-z] [a-z]/g,
            (match: string): string => `${match[0]}${match[2].toUpperCase()}`
          )
      )
      // * Add other symptoms if selected
      .concat(symptoms.includes(SymptomEnum.OTHER) ? [otherSymptoms] : [])
  );
};
