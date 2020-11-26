import { EndpointEnum } from '../../server';
import { BASE_URL } from '../../server/utils';

export const GESTATIONAL_AGE_UNITS = {
  WEEKS: 'GESTATIONAL_AGE_UNITS_WEEKS',
  MONTHS: 'GESTATIONAL_AGE_UNITS_MONTHS',
};

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

export const getPatientState = async (patientId: string | undefined): Promise<PatientState> => {
  if(patientId === undefined) {
    return {...initialState};
  }

  const fetchOptions = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  };

  let resp = await fetch(BASE_URL + EndpointEnum.PATIENTS + '/' + patientId + EndpointEnum.INFO, fetchOptions);
  let state = await resp.json();

  delete state['base'];
  delete state['created'];
  delete state['lastEdited'];
  
  state[PatientField.isExactDob] = Boolean(state[PatientField.isExactDob]);

  // TODO calculate estimated age & gestational ages from the dates in the JSON response
  // if(!state[PatientField.isExactDob]) {
    
  // }

  // if(state[PatientField.isPregnant]) {

  // }

  return state;
}