import { Dispatch, SetStateAction } from 'react';
import { McOption } from 'src/shared/types/form/formTypes';

export const handleAddChoice = (
  numChoices: number,
  inputLanguages: string[],
  setNumChoices: React.Dispatch<React.SetStateAction<number>>,
  mcOptions: McOption[],
  setMcOptions: Dispatch<SetStateAction<McOption[]>>
) => {
  const newNumChoices = numChoices + 1;
  
  // Create a new option with empty translations for all languages
  const newOption: McOption = {
    translations: {}
  };
  
  inputLanguages.forEach((lang) => {
    newOption.translations[lang.toLowerCase()] = '';
  });
  
  setMcOptions([...mcOptions, newOption]);
  setNumChoices(newNumChoices);
};

export const handleRemoveMultiChoice = (
  index: number,
  numChoices: number,
  mcOptions: McOption[],
  inputLanguages: string[],
  setNumChoices: React.Dispatch<React.SetStateAction<number>>,
  setMcOptions: Dispatch<SetStateAction<McOption[]>>
) => {
  // Remove the option at the specified index
  const updatedOptions = mcOptions.filter((_, idx) => idx !== index);
  
  const newNumChoices = numChoices - 1;
  setNumChoices(newNumChoices);
  setMcOptions(updatedOptions);
};

export const handleMultiChoiceOptionChange = (
  language: string,
  option: string,
  index: number,
  mcOptions: McOption[],
  setMcOptions: Dispatch<SetStateAction<McOption[]>>
) => {
  const updatedOptions = [...mcOptions];
  
  // Ensure the option exists at this index
  if (!updatedOptions[index]) {
    updatedOptions[index] = { translations: {} };
  }
  
  // Ensure translations object exists
  if (!updatedOptions[index].translations) {
    updatedOptions[index].translations = {};
  }
  
  // Update the translation for this language
  updatedOptions[index].translations[language.toLowerCase()] = option;
  
  setMcOptions(updatedOptions);
};

export const handleRadioChange = (
  event: {
    target: { value: SetStateAction<string> };
  },
  setFieldType: React.Dispatch<React.SetStateAction<string>>,
  setFieldChanged: React.Dispatch<React.SetStateAction<boolean>>,
  setFormDirty: React.Dispatch<React.SetStateAction<boolean>>,
  fieldChanged: boolean
) => {
  setFieldType(event.target.value);
  setFieldChanged(!fieldChanged);
  setFormDirty(true);
};

export const handleVisibilityChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setEnableVisiblity: React.Dispatch<React.SetStateAction<boolean>>,
  setFormDirty: React.Dispatch<React.SetStateAction<boolean>>,
  setFieldChanged: React.Dispatch<React.SetStateAction<boolean>>,
  fieldChanged: boolean
) => {
  setEnableVisiblity(event.target.checked);
  setFormDirty(true);
  setFieldChanged(!fieldChanged);
};

export const handleRequiredChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setIsRequired: React.Dispatch<React.SetStateAction<boolean>>,
  setFormDirty: React.Dispatch<React.SetStateAction<boolean>>,
  setFieldChanged: React.Dispatch<React.SetStateAction<boolean>>,
  fieldChanged: boolean
) => {
  setIsRequired(event.target.checked);
  setFormDirty(true);
  setFieldChanged(!fieldChanged);
};

export const handleAllowPastDatesChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setAllowPastDates: React.Dispatch<React.SetStateAction<boolean>>,
  setFormDirty: React.Dispatch<React.SetStateAction<boolean>>,
  setFieldChanged: React.Dispatch<React.SetStateAction<boolean>>,
  fieldChanged: boolean
) => {
  setAllowPastDates(event.target.checked);
  setFormDirty(true);
  setFieldChanged(!fieldChanged);
};

export const handleAllowFutureDatesChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setAllowFutureDates: React.Dispatch<React.SetStateAction<boolean>>,
  setFormDirty: React.Dispatch<React.SetStateAction<boolean>>,
  setFieldChanged: React.Dispatch<React.SetStateAction<boolean>>,
  fieldChanged: boolean
) => {
  setAllowFutureDates(event.target.checked);
  setFormDirty(true);
  setFieldChanged(!fieldChanged);
};

export const handleIsNumOfLinesRestrictedChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setIsNumOfLinesRestricted: React.Dispatch<React.SetStateAction<boolean>>,
  setFormDirty: React.Dispatch<React.SetStateAction<boolean>>,
  setFieldChanged: React.Dispatch<React.SetStateAction<boolean>>,
  setStringMaxLines: React.Dispatch<React.SetStateAction<number | string | null>>,
  fieldChanged: boolean
) => {
  setIsNumOfLinesRestricted(event.target.checked);
  setFormDirty(true);
  setFieldChanged(!fieldChanged);
  if (event.target.checked === false) {
    setStringMaxLines(null);
  }
};