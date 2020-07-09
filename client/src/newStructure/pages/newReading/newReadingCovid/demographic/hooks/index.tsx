import React from 'react';
import { GESTATIONAL_AGE_UNITS } from '../../../patientInfoForm';
import { validateInput } from '../validation';

export const useNewPatient = () => {
  const [patient, setPatient] = React.useState({
    household: '',
    patientInitial: '',
    patientId: '',
    patientName: '',
    patientAge: 0,
    patientSex: 'FEMALE',
    isPregnant: false,
    gestationalAgeValue: '',
    gestationalAgeUnit: GESTATIONAL_AGE_UNITS.WEEKS,
    zone: '',
    dob: null,
    villageNumber: '',
    drugHistory: '',
    medicalHistory: '',
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
  });
  const getAgeBasedOnDOB = (value: string) => {
    const year: string = value.substr(0, value.indexOf('-'));
    const yearNow: number = new Date().getUTCFullYear();
    return yearNow - +year;
  };

  const handleChangePatient = (e: any) => {
    const errors: any = validateInput(e.target.name, e.target.value);
    const name = e.target.name;

    if (name === 'patientSex') {
      if (e.target.value === 'MALE') {
        setPatient({
          ...patient,
          [name]: e.target.value,
          gestationalAgeValue: '',
          isPregnant: false,
        });
      } else {
        setPatient({
          ...patient,
          [name]: e.target.value,
        });
      }
    }
    if (name === 'isPregnant') {
      if (e.target.checked) {
        setPatient({
          ...patient,
          [name]: e.target.checked,
        });
      } else {
        setPatient({
          ...patient,
          [name]: e.target.checked,
          gestationalAgeValue: '',
        });
      }
    }
    if (name === 'dob') {
      const calculatedAge: number = getAgeBasedOnDOB(e.target.value);
      setPatient({
        ...patient,
        [name]: e.target.value,
        patientAge: calculatedAge,
        dobError: errors.dobError,
      });
    }
    if (name == 'patientInitial') {
      setPatient({
        ...patient,
        [name]: e.target.value,
        patientInitialError: errors.patientInitialError,
      });
    }
    if (name == 'patientId') {
      setPatient({
        ...patient,
        [name]: e.target.value,
        patientIdError: errors.patientIdError,
      });
    }
    if (name == 'patientAge') {
      setPatient({
        ...patient,
        [name]: e.target.value,
        patientAgeError: errors.patientAgeError,
      });
    }
    if (name == 'household') {
      setPatient({
        ...patient,
        [name]: e.target.value,
        // error check for household?
      });
    }
    if (name == 'gestationalAgeUnit') {
      setPatient({
        ...patient,
        [name]: e.target.value,
      });
    }
    if (name == 'gestationalAgeValue') {
      let gestationalAgeValueError = false;
      if (e.target.value === GESTATIONAL_AGE_UNITS.WEEKS) {
        if (e.target.value > 60 || e.target.value < 1) {
          gestationalAgeValueError = true;
        }
      }
      if (e.target.value === GESTATIONAL_AGE_UNITS.MONTHS) {
        if (e.target.value > 12 || e.target.value < 1) {
          gestationalAgeValueError = true;
        }
      }
      console.log('errors.gestationalAgeValueError', gestationalAgeValueError);
      setPatient({
        ...patient,
        [name]: e.target.value,
        gestationalAgeValueError: gestationalAgeValueError,
      });
    }
    console.log('DATA', patient);
  };
  return { patient, handleChangePatient };
};
