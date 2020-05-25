import { TrafficLightEnum } from '../../../../enums';
import { Patient, Reading } from '../../../../types';
import {
  getMomentDate, GESTATIONAL_AGE_UNITS,
} from '../../../utils';

export const guid = () =>
  `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0;
    var v = c === `x` ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const getReferralIds = (selectedPatient: Patient): Array<string> => 
selectedPatient.readings
  .filter((reading: Reading): boolean => reading.referral !== null)
  .map(({ referral }: Reading): string => referral);

export const calculateShockIndex = (reading: Reading) => {
  const RED_SYSTOLIC = 160;
  const RED_DIASTOLIC = 110;
  const YELLOW_SYSTOLIC = 140;
  const YELLOW_DIASTOLIC = 90;
  const SHOCK_HIGH = 1.7;
  const SHOCK_MEDIUM = 0.9;

  if (
    reading.bpSystolic === undefined ||
    reading.bpDiastolic === undefined ||
    reading.heartRateBPM === undefined
  ) {
    return TrafficLightEnum.NONE;
  }

  const shockIndex = reading.heartRateBPM / reading.bpSystolic;

  const isBpVeryHigh =
    reading.bpSystolic >= RED_SYSTOLIC ||
    reading.bpDiastolic >= RED_DIASTOLIC;
  const isBpHigh =
    reading.bpSystolic >= YELLOW_SYSTOLIC ||
    reading.bpDiastolic >= YELLOW_DIASTOLIC;
  const isSevereShock = shockIndex >= SHOCK_HIGH;
  const isShock = shockIndex >= SHOCK_MEDIUM;

  if (isSevereShock) {
    return TrafficLightEnum.RED_DOWN;
  } else if (isBpVeryHigh) {
    return TrafficLightEnum.RED_UP;
  } else if (isShock) {
    return TrafficLightEnum.YELLOW_DOWN;
  } else if (isBpHigh) {
    return TrafficLightEnum.YELLOW_UP;
  } 

  return TrafficLightEnum.GREEN;
};

export const createReading = ({
  readingId,
  dateTimeTaken,
  bpDiastolic,
  bpSystolic,
  heartRateBPM,
  symptoms,
  trafficLightStatus,
  isReferred,
  dateReferred,
  drugHistory,
  medicalHistory,
  urineTests,
}: any): any => {
  return {
    readingId,
    dateTimeTaken,
    bpDiastolic,
    bpSystolic,
    heartRateBPM,
    symptoms,
    trafficLightStatus,
    isReferred,
    dateReferred,
    drugHistory,
    medicalHistory,
    urineTests,
  };
};

export const sortReadings = (readings: Array<Reading>): Array<Reading> =>
  readings.sort((reading: Reading, otherReading: Reading) =>
    getMomentDate(otherReading.dateTimeTaken).valueOf() -
    getMomentDate(reading.dateTimeTaken).valueOf()
  );

export interface IState {
  displayPatientModal: boolean,
  selectedPatient: {
    readings: any,
    patientName: string,
    patientId: string,
    dob: string,
    patientAge: string,
    patientSex: string,
    isPregnant: boolean,
    gestationalAgeValue: string,
    gestationalAgeUnit: any,
    drugHistory: string,
    medicalHistory: string,
    bpSystolic: string,
    bpDiastolic: string,
    heartRateBPM: string,
  },
  patient: string,
  showVitals: boolean,
  showTrafficLights: boolean,
  displayReadingModal: boolean,
  newReading: {
    userId: string,
    readingId: string,
    dateTimeTaken: string,
    bpSystolic: string,
    bpDiastolic: string,
    heartRateBPM: string,
    dateRecheckVitalsNeeded: string,
    isFlaggedForFollowup: boolean,
    symptoms: string,
    urineTests: any,
  },
  checkedItems: {
    none: boolean,
    headache: boolean,
    bleeding: boolean,
    blurredVision: boolean,
    feverish: boolean,
    abdominalPain: boolean,
    unwell: boolean,
    other: boolean,
    otherSymptoms: string,
  },
  showSuccessReading: boolean,
  selectedPatientCopy: { readings: any },
  hasUrineTest: boolean,
}

export const initialState: IState = {
  displayPatientModal: false,
  selectedPatient: {
    readings: [],
    patientName: ``,
    patientId: ``,
    dob: ``,
    patientAge: ``,
    patientSex: ``,
    isPregnant: false,
    gestationalAgeValue: ``,
    gestationalAgeUnit: GESTATIONAL_AGE_UNITS.WEEKS,
    drugHistory: ``,
    medicalHistory: ``,
    bpSystolic: ``,
    bpDiastolic: ``,
    heartRateBPM: ``,
  },
  patient: ``,
  showVitals: true,
  showTrafficLights: false,
  displayReadingModal: false,
  newReading: {
    userId: '',
    readingId: '',
    dateTimeTaken: '',
    bpSystolic: '',
    bpDiastolic: '',
    heartRateBPM: '',
    dateRecheckVitalsNeeded: '',
    isFlaggedForFollowup: false,
    symptoms: '',
    urineTests: INITIAL_URINE_TESTS,
  },
  checkedItems: {
    none: true,
    headache: false,
    bleeding: false,
    blurredVision: false,
    feverish: false,
    abdominalPain: false,
    unwell: false,
    other: false,
    otherSymptoms: '',
  },
  showSuccessReading: false,
  selectedPatientCopy: { readings: [] },
  hasUrineTest: false,
};
