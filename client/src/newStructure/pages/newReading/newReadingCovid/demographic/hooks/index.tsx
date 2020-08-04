import React from 'react';
import { GESTATIONAL_AGE_UNITS } from '../../../patientInfoForm';
import { validateInput } from '../validation';
import moment from 'moment';

export const useNewPatient = () => {
  const [patient, setPatient] = React.useState({
    household: '',
    patientInitial: '',
    patientId: '',
    patientName: '',
    patientAge: 15,
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

  //~~~~~~~ format DOB for backend ~~~~~~~~~~
  const calculateDOB = (value: number) => {
    const currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() - value);
    return moment(currentDate).format('YYYY-MM-DD');
  };

  //~~~~~~~ Calculate DOB based on Age ~~~~~~~~~~
  const getAgeBasedOnDOB = (value: string) => {
    const year: string = value.substr(0, value.indexOf('-'));
    const yearNow: number = new Date().getUTCFullYear();
    return yearNow - +year;
  };

  //~~~~~~~ Reset All values ~~~~~~~~~~
  const resetValuesPatient = (reset: boolean) => {
    if (reset) {
      setPatient({
        household: '',
        patientInitial: '',
        patientId: '',
        patientName: '',
        patientAge: 15,
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
    }
  };

  //~~~~~~~ Format Gestational Age to UNIX ~~~~~~~~~~
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
    return Math.floor(currentDate.getTime() / 1000);
  };

  //~~~~~~~ handle onChange Event ~~~~~~~~~~
  const handleChangePatient = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    const errors: any = validateInput(name, value);

    if (name === 'patientSex') {
      if (value === 'MALE') {
        setPatient({
          ...patient,
          [name]: value,
          gestationalAgeValue: '',
          isPregnant: false,
        });
      } else {
        setPatient({
          ...patient,
          [name]: value,
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
    if (name === 'patientInitial') {
      setPatient({
        ...patient,
        [name]: value,
        patientInitialError: errors.patientInitialError,
      });
    }
    if (name === 'patientId') {
      setPatient({
        ...patient,
        [name]: value,
        patientIdError: errors.patientIdError,
      });
    }
    if (name === 'dob') {
      const dob = value ? value : patient.dob;
      const calculatedAge: number = getAgeBasedOnDOB(dob);
      setPatient({
        ...patient,
        [name]: value,
        patientAge: calculatedAge,
        dobError: errors.dobError,
        patientAgeError: errors.patientAgeError,
      });
    }
    if (name === 'patientAge') {
      const age = calculateDOB(value);
      setPatient({
        ...patient,
        [name]: value,
        dob: age,
        dobError: errors.dobError,
        patientAgeError: errors.patientAgeError,
      });
    }
    if (name === 'gestationalAgeUnit') {
      setPatient({
        ...patient,
        [name]: value,
        gestationalAgeValue: '0',
      });
    }
    if (name === 'gestationalAgeValue') {
      let gestationalAgeValueError = false;
      if (patient.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.WEEKS) {
        if (value > 60 || value < 1) {
          gestationalAgeValueError = true;
        }
      }
      if (patient.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.MONTHS) {
        if (value > 12 || value < 1) {
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
      name === 'medicalHistory' ||
      name === 'household'
    ) {
      setPatient({
        ...patient,
        [name]: value,
      });
    }
  };
  return {
    patient,
    handleChangePatient,
    resetValuesPatient,
  };
};
