import { GestationalAgeUnitEnum } from 'src/enums';
import { getAgeBasedOnDOB } from 'src/shared/utils';
import { PatientField, PatientState } from './state';

// For writing + testing Regex, see: regex101.com

export const validateForm = (values: PatientState): any => {
  const errors: any = {};

  validatePatientId(values, errors);
  validatePatientName(values, errors);
  validateDobOrAge(values, errors);
  validateVillage(values, errors);
  validateGestational(values, errors);

  return errors;
};

const validatePatientId = (values: PatientState, errors: any) => {
  const patientId = values[PatientField.patientId];

  if (patientId.length === 0 || patientId.length > 15 || isNaN(+patientId)) {
    errors[PatientField.patientId] = 'A valid patient ID is required.';
  }
};

const validatePatientName = (values: PatientState, errors: any) => {
  const patientName = values[PatientField.patientName];

  // a name consists of one or more word characters (w) and may include: . ' -
  // e.g. John A. Smith-O'Hare
  if (/^\w[\w.'\- ]*$/.test(patientName) === false) {
    errors[PatientField.patientName] = 'A valid patient name is required.';
  }
};

const validateDobOrAge = (values: PatientState, errors: any) => {
  if (values[PatientField.isExactDob]) {
    const age = getAgeBasedOnDOB(values[PatientField.dob]);

    if (!ageIsValid(age)) {
      errors[PatientField.dob] =
        'Please enter a valid date of birth corresponding to an age between 15 - 65.';
    }
  } else {
    if (!ageIsValid(parseInt(values[PatientField.estimatedAge]))) {
      errors[PatientField.estimatedAge] =
        'Please enter a valid age between 15 - 65.';
    }
  }
};

const ageIsValid = (age: number): boolean => {
  return age >= 15 && age <= 65;
};

const validateVillage = (values: PatientState, errors: any) => {
  // if a village number is entered, it must consist of 1 or more numbers
  if (
    values[PatientField.villageNumber] !== '' &&
    /^[0-9]+$/.test(values[PatientField.villageNumber]) === false
  ) {
    errors[PatientField.villageNumber] = 'Village number must be numeric.';
  }
};

const validateGestational = (values: PatientState, errors: any) => {
  if (!values[PatientField.isPregnant]) {
    return;
  }

  const unit = values[PatientField.gestationalAgeUnit];
  const age = parseInt(values[PatientField.gestationalAge]);

  if (unit === GestationalAgeUnitEnum.WEEKS) {
    if (isNaN(age) || !(age >= 0 && age <= 60)) {
      errors[PatientField.gestationalAge] =
        'Please enter between 0 and 60 weeks.';
    }
  } else if (unit === GestationalAgeUnitEnum.MONTHS) {
    if (isNaN(age) || !(age >= 0 && age <= 13)) {
      errors[PatientField.gestationalAge] =
        'Please enter between 0 and 13 months.';
    }
  }
};
