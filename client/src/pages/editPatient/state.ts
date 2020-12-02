import {
  GESTATIONAL_AGE_UNITS,
  getAgeBasedOnDOB,
  getNumOfMonthsNumeric,
  getNumOfWeeks,
} from '../../../src/shared/utils';
import { EndpointEnum } from '../../server';
import { BASE_URL } from '../../server/utils';

export const SEXES = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
};

export enum PatientField {
  patientId = 'patientId',
  patientName = 'patientName',
  householdNumber = 'householdNumber',
  isExactDob = 'isExactDob',
  dob = 'dob',
  estimatedAge = 'estimatedAge',
  zone = 'zone',
  villageNumber = 'villageNumber',
  patientSex = 'patientSex',
  isPregnant = 'isPregnant',
  gestationalAge = 'gestationalAge',
  gestationalAgeUnit = 'gestationalAgeUnit',
  drugHistory = 'drugHistory',
  medicalHistory = 'medicalHistory',
}

export const initialState = {
  [PatientField.patientId]: '',
  [PatientField.patientName]: '',
  [PatientField.householdNumber]: '',
  [PatientField.isExactDob]: true,
  [PatientField.dob]: '',
  [PatientField.estimatedAge]: '',
  [PatientField.zone]: '',
  [PatientField.villageNumber]: '',
  [PatientField.patientSex]: SEXES.MALE,
  [PatientField.isPregnant]: false,
  [PatientField.gestationalAge]: '',
  [PatientField.gestationalAgeUnit]: GESTATIONAL_AGE_UNITS.WEEKS,
  [PatientField.drugHistory]: '',
  [PatientField.medicalHistory]: '',
};

export type PatientState = typeof initialState;

export const getPatientState = async (
  patientId: string | undefined
): Promise<PatientState> => {
  if (patientId === undefined) {
    return { ...initialState };
  }

  const fetchOptions = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  };

  const resp = await fetch(
    BASE_URL + EndpointEnum.PATIENTS + '/' + patientId + EndpointEnum.PATIENT_INFO,
    fetchOptions
  );

  const state = await resp.json();

  // modify the response from the server to be what the frontend expects
  delete state['base'];
  delete state['created'];
  delete state['lastEdited'];

  state[PatientField.isExactDob] = Boolean(state[PatientField.isExactDob]);

  if (!state[PatientField.isExactDob]) {
    state[PatientField.estimatedAge] = getAgeBasedOnDOB(
      state[PatientField.dob]
    );
    state[PatientField.dob] = '';
  }

  if (state[PatientField.isPregnant]) {
    switch (state[PatientField.gestationalAgeUnit]) {
      case GESTATIONAL_AGE_UNITS.WEEKS:
        state[PatientField.gestationalAge] = getNumOfWeeks(
          state.gestationalTimestamp
        );
        break;
      case GESTATIONAL_AGE_UNITS.MONTHS:
        state[PatientField.gestationalAge] = getNumOfMonthsNumeric(
          state.gestationalTimestamp
        );
        break;
    }
  }

  return state;
};
