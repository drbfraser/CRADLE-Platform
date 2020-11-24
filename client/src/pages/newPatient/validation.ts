import { GESTATIONAL_AGE_UNITS, PatientField, PatientState } from './state';

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

  if(patientId.length === 0 || patientId.length > 15 || isNaN(+patientId)) {
    errors[PatientField.patientId] = 'A valid patient ID is required.';
  }
}

const validatePatientName = (values: PatientState, errors: any) => {
  const patientName = values[PatientField.patientName];

  if(/^\w[\w+\- ]*$/.test(patientName) === false) {
    errors[PatientField.patientName] = 'A valid patient name is required.';
  }
}

const validateDobOrAge = (values: PatientState, errors: any) => {
  if(values[PatientField.isExactDob]) {
    const dateOfBirth = values[PatientField.dob];
    const year: string = dateOfBirth.substr(0, dateOfBirth.indexOf('-'));
    const yearNow: number = new Date().getUTCFullYear();
    const age = yearNow - +year;
    
    if(!ageIsValid(age)) {
      errors[PatientField.dob] = 'Please enter a valid date of birth.';
    }
  } else {
    if(!ageIsValid(parseInt(values[PatientField.estimatedAge]))) {
      errors[PatientField.estimatedAge] = 'Please enter a valid age.';
    }
  }
}

const ageIsValid = (age: number): boolean => {
  return age >= 1 && age <= 100;
}

const validateVillage = (values: PatientState, errors: any) => {
  if(values[PatientField.villageNumber] !== '' && /^[0-9]+$/.test(values[PatientField.villageNumber]) === false) {
    errors[PatientField.villageNumber] = 'Village number must be numeric.';
  }
}

const validateGestational = (values: PatientState, errors: any) => {
  if(!values[PatientField.isPregnant]) {
    return;
  }

  const unit = values[PatientField.gestationalAgeUnit];
  const age = parseInt(values[PatientField.gestationalAge]);

  if(unit === GESTATIONAL_AGE_UNITS.WEEKS) {
    if(isNaN(age) || !(age >= 0 && age <= 60)) {
      errors[PatientField.gestationalAge] = 'Please enter between 0 and 60 weeks.';
    }
  } else if(unit === GESTATIONAL_AGE_UNITS.MONTHS) {
    if(isNaN(age) || !(age >= 0 && age <= 13)) {
      errors[PatientField.gestationalAge] = 'Please enter between 0 and 13 months.';
    }
  }
}
