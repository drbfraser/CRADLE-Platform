import { SymptomEnum } from 'src/enums';

export const toggleNoneSymptom = (
  noneCurrentlySelected: boolean
): Record<SymptomEnum, boolean> => {
  if (noneCurrentlySelected) {
    // * None has been deselected,
    return Object.values(SymptomEnum).reduce(
      (
        symptoms: Record<string, boolean>,
        symptom: SymptomEnum
      ): Record<string, boolean> => {
        return {
          ...symptoms,
          [symptom]: false,
        };
      },
      {}
    ) as Record<SymptomEnum, boolean>;
  }

  // * None has been selected,
  // * therefore make sure everyting else is deselected
  return Object.values(SymptomEnum).reduce(
    (
      symptoms: Record<string, boolean>,
      symptom: SymptomEnum
    ): Record<string, boolean> => {
      return { ...symptoms, [symptom]: symptom === SymptomEnum.NONE };
    },
    {}
  ) as Record<SymptomEnum, boolean>;
};

export const updateSelectedSymptoms = (
  symptomToToggle: SymptomEnum,
  selectedSymptoms: Record<SymptomEnum, boolean>
): Record<SymptomEnum, boolean> => {
  const newSelectedSypmtoms = Object.entries(selectedSymptoms).reduce(
    (
      newSymptoms: Record<string, boolean>,
      [symptom, selected]: [SymptomEnum, boolean]
    ): Record<string, boolean> => {
      return {
        ...newSymptoms,
        [symptom]:
          symptom === symptomToToggle ? !selected : selectedSymptoms[symptom],
      };
    },
    {}
  ) as Record<SymptomEnum, boolean>;

  const selected = Object.values(newSelectedSypmtoms).filter(
    (value: boolean): boolean => value
  );

  if (selected.length > 1) {
    newSelectedSypmtoms[SymptomEnum.NONE] = false;
  }

  return newSelectedSypmtoms;
};
