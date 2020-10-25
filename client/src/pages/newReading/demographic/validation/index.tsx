const hasNumber = (myString: any) => {
  return /^[0-9]+$/.test(myString);
};
const isPatientInitialsValid = (myString: any) => {
  return /^\w[\w+\- ]*$/.test(myString);
};
export const validateInput = (name: any, value: any) => {
  const patientError = {
    householdError: false,
    patientInitialError: false,
    patientIdError: false,
    patientNameError: false,
    patientAgeError: false,
    patientSexError: false,
    isPregnantError: false,
    gestationalAgeValueError: false,
    gestationalAgeUnitError: false,
    zoneError: false,
    dobError: false,
    villageNumberError: false,
    drugHistoryError: false,
    medicalHistoryError: false,
  };
  let age = 15;
  if (name === 'dob') {
    const year: string = value.substr(0, value.indexOf('-'));
    const yearNow: number = new Date().getUTCFullYear();
    age = yearNow - +year;
  }
  switch (name) {
    case 'patientInitial':
      if (!isPatientInitialsValid(value)) {
        patientError.patientInitialError = true;
      }
      break;
    case 'villageNumber':
      if (!hasNumber(value)) {
        patientError.villageNumberError = true;
      }
      break;
    case 'patientId':
      if (value.length > 14 || value.length < 1 || isNaN(+value)) {
        patientError.patientIdError = true;
      }
      break;
    case 'dob':
      if (age > 65 || age < 15) {
        patientError.dobError = true;
        patientError.patientAgeError = true;
      }
      break;
    case 'patientAge':
      if (value > 65 || value < 15) {
        patientError.patientAgeError = true;
        patientError.dobError = true;
      }
      break;

    default:
      break;
  }

  return patientError;
};
