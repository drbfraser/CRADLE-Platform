import {
  getNumOfMonths,
  getNumOfWeeks,
  getAgeBasedOnDOB,
} from '../../../../shared/utils';
import { GESTATIONAL_AGE_UNITS } from '../../patientInfoForm';
import { GestationalAgeUnitEnum } from '../../../../enums';
import { Patient } from '@types';
import React from 'react';
import moment from 'moment';
import { validateInput } from '../validation';

const initializePatientKeys = [
  `household`,
  `patientInitial`,
  `patientId`,
  `patientName`,
  `patientSex`,
  `isPregnant`,
  `zone`,
  `villageNumber`,
  `drugHistory`,
  `medicalHistory`,
  `dob?`,
  `patientAge`,
  `gestationalAgeValue`,
  `gestationalAgeValueTimestamp`,
  `gestationalAgeUnit`,
];

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
    gestationalAgeValueTimestamp: 0,
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
        gestationalAgeValueTimestamp: 0,
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
        gestationalAgeValueTimestamp: calculateGestationalAgeValue(
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

  //~~~~~~~ initialize the edited patient ~~~~~~~~~~
  const initializeEditPatient = React.useCallback((patient: Patient): void => {
    const initializedPatient = Object.entries(patient).reduce(
      (
        initialized: Record<string, any>,
        [key, value]: [keyof Patient, Patient[keyof Patient]]
      ): Record<string, any> => {
        if (initializePatientKeys.includes(key)) {
          initialized[key] = value;

          if (key === `patientName`) {
            initialized.patientInitial = value;
          }
        }

        if (key === `gestationalTimestamp` && value !== 0) {
          initialized.gestationalAgeValueTimestamp = value;
          initialized.gestationalAgeValue =
            patient.gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
              ? getNumOfWeeks(Number(value))
              : getNumOfMonths(Number(value));
        }

        return initialized;
      },
      {}
    );

    setPatient((currentPatient) => ({
      ...currentPatient,
      ...initializedPatient,
    }));
  }, []);

  return {
    patient,
    handleChangePatient,
    initializeEditPatient,
    resetValuesPatient,
  };
};
