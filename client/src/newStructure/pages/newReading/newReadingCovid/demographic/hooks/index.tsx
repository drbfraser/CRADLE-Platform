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
    gestationalAgeValueTimeStamp: 0,
    gestationalAgeUnit: GESTATIONAL_AGE_UNITS.WEEKS,
    zone: '',
    dob: '2004-01-01',
    villageNumber: '',
    drugHistory: '',
    medicalHistory: '',
    dobOrAge: false,
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

  const calculateGestationalAgeValue = (value: string) => {
    const currentDate = new Date();
    let subtractValue = 0;
    if (patient.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.WEEKS) {
      subtractValue = +value * 7;
      currentDate.setDate(currentDate.getDate() - subtractValue);
    }
    if (patient.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.MONTHS) {
      currentDate.setMonth(currentDate.getMonth() - +value);
    }
    return currentDate.getTime() / 1000;
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
      const dob = e.target.value ? e.target.value : patient.dob;
      const calculatedAge: number = getAgeBasedOnDOB(dob);
      setPatient({
        ...patient,
        [name]: e.target.value,
        patientAge: calculatedAge,
        dobError: errors.dobError,
      });
    }
    if (name === 'patientInitial') {
      setPatient({
        ...patient,
        [name]: e.target.value,
        patientInitialError: errors.patientInitialError,
      });
    }
    if (name === 'patientId') {
      setPatient({
        ...patient,
        [name]: e.target.value,
        patientIdError: errors.patientIdError,
      });
    }
    if (name === 'patientAge') {
      setPatient({
        ...patient,
        [name]: e.target.value,
        patientAgeError: errors.patientAgeError,
      });
    }
    if (name === 'household') {
      setPatient({
        ...patient,
        [name]: e.target.value,
        // error check for household?
      });
    }
    if (name === 'gestationalAgeUnit') {
      setPatient({
        ...patient,
        [name]: e.target.value,
        gestationalAgeValue: '0',
      });
    }
    if (name === 'dobOrAge') {
      setPatient({
        ...patient,
        [name]: e.target.checked,
      });
    }
    if (name === 'gestationalAgeValue') {
      let gestationalAgeValueError = false;
      if (patient.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.WEEKS) {
        if (e.target.value > 60 || e.target.value < 1) {
          gestationalAgeValueError = true;
        }
      }
      if (patient.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.MONTHS) {
        if (e.target.value > 12 || e.target.value < 1) {
          gestationalAgeValueError = true;
        }
      }
      setPatient({
        ...patient,
        [name]: e.target.value,
        gestationalAgeValueTimeStamp: calculateGestationalAgeValue(
          e.target.value
        ),
        gestationalAgeValueError: gestationalAgeValueError,
      });
    }
    if (
      name === 'zone' ||
      name === 'villageNumber' ||
      name === 'drugHistory' ||
      name === 'medicalHistory'
    ) {
      setPatient({
        ...patient,
        [name]: e.target.value,
      });
    }
  };
  return { patient, handleChangePatient };
};
