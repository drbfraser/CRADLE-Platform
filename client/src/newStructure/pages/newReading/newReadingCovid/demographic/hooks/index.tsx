import React from 'react';
import { GESTATIONAL_AGE_UNITS } from '../../../patientInfoForm';

export const useNewPatient = () => {
  const [patient, setPatient] = React.useState({
    household: '',
    patientInitial: '',
    patientId: '',
    patientName: '',
    patientAge: 0,
    patientSex: 'FEMALE',
    isPregnant: true,
    gestationalAgeValue: '',
    gestationalAgeUnit: GESTATIONAL_AGE_UNITS.WEEKS,
    zone: '',
    dob: null,
    villageNumber: '',
    drugHistory: '',
    medicalHistory: '',
  });
  const getAgeBasedOnDOB = (value: string) => {
    const year: string = value.substr(0, value.indexOf('-'));
    const yearNow: number = new Date().getUTCFullYear();
    return yearNow - +year;
  };
  const handleChangePatient = (e: any) => {
    if (e.target.name === 'patientSex' && e.target.name === 'MALE') {
      setPatient({
        ...patient,
        [e.target.name]: e.target.value,
        gestationalAgeValue: '',
        isPregnant: false,
      });
    }
    if (e.target.name === 'dob') {
      const calculatedAge: number = getAgeBasedOnDOB(e.target.value);
      setPatient({
        ...patient,
        [e.target.name]: e.target.value,
        patientAge: calculatedAge,
      });
    } else {
      setPatient({
        ...patient,
        [e.target.name]: e.target.value,
      });
    }
  };
  return { patient, handleChangePatient };
};
