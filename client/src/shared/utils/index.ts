import {
  GlobalSearchPatient,
  OrNull,
  OrUndefined,
  Patient,
  Reading,
} from '@types';

import { TrafficLightEnum } from '../../enums';
import moment from 'moment';

export { v4 as makeUniqueId } from 'uuid';

export const getLatestReadingWithReferral = (
  readings: Array<Reading>
): OrUndefined<Reading> => {
  // * Sort readings in ascending order of date reading was taken
  // * Therefore, first reading is the last one to be taken
  return readings
    .filter((reading: Reading): boolean => Boolean(reading.referral))
    .sort((reading: Reading, otherReading: Reading): number => {
      return (
        getMomentDate(otherReading.dateTimeTaken).valueOf() -
        getMomentDate(reading.dateTimeTaken).valueOf()
      );
    })[0];
};

export const getTimestampFromWeeks = (weeks: string): number => {
  const gestationalDate = new Date();

  // * Set gestational time as difference between number of weeks and now
  gestationalDate.setTime(
    gestationalDate.getTime() - Number(weeks) * 7 * 24 * 60 * 60 * 1000
  );

  // * Convert to seconds
  return gestationalDate.getTime() / 1000;
};

export const getTimestampFromMonths = (months: string): number => {
  if (months === `Less than 1`) {
    return Date.now() / 1000;
  }

  const gestationalDate = new Date();

  // * Set gestational time as difference between number of months and now
  gestationalDate.setTime(
    gestationalDate.getTime() - Number(months) * 4 * 7 * 24 * 60 * 60 * 1000
  );

  // * Convert to seconds
  return gestationalDate.getTime() / 1000;
};

export const getNumOfWeeks = (timestamp: number): number => {
  const todaysDate = new Date();
  const gestationalDate = new Date(timestamp * 1000);
  const difference = todaysDate.getTime() - gestationalDate.getTime();
  return Math.round(difference / (7 * 24 * 60 * 60 * 1000)) || 1;
};

export const getNumOfMonthsNumeric = (timestamp: number): number => {
  const todaysDate = new Date();
  const gestationalDate = new Date(timestamp * 1000);
  const difference = todaysDate.getTime() - gestationalDate.getTime();
  const numOfMonths = Math.floor(difference / (4 * 7 * 24 * 60 * 60 * 1000));

  return numOfMonths;
};

export const getNumOfMonths = (timestamp: number): number | string => {
  const numOfMonths = getNumOfMonthsNumeric(timestamp);
  return numOfMonths === 0 ? `Less than 1` : numOfMonths;
};

export const calculateShockIndex = (reading: Reading): TrafficLightEnum => {
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
    reading.bpSystolic >= RED_SYSTOLIC || reading.bpDiastolic >= RED_DIASTOLIC;

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

export const getMomentDate = (dateS: OrNull<number>): moment.Moment => {
  return moment(dateS ?? 0);
};

export const getPrettyDate = (dateStr: number): string => {
  // * Date comes in from the backend in seconds
  // * Moment date requires milliseconds
  return getMomentDate(dateStr * 1000).format('YYYY-MM-DD');
};

export const getPrettyDateTime = (dateStr: number): string => {
  // * Date comes in from the backend in seconds
  // * Moment date requires milliseconds
  return getMomentDate(dateStr * 1000).format('YYYY-MM-DD');
};

export const getPrettyDateYYYYmmDD = (dateStr: string): string => {
  return moment(dateStr).format('YYYY-MM-DD');
};

export const getLatestReading = (readings: Array<Reading>): Reading => {
  const sortedReadings = readings.sort(
    (reading: Reading, otherReading: Reading) =>
      getMomentDate(otherReading.dateTimeTaken).valueOf() -
      getMomentDate(reading.dateTimeTaken).valueOf()
  );
  return sortedReadings[0];
};

export const getLatestReadingDateTime = (
  readings: Array<Reading>
): OrNull<number> => {
  return getLatestReading(readings).dateTimeTaken;
};

export const sortPatientsByLastReading = (
  patient: Patient | GlobalSearchPatient,
  otherPatient: Patient | GlobalSearchPatient
): number => {
  return (
    getMomentDate(getLatestReadingDateTime(otherPatient.readings)).valueOf() -
    getMomentDate(getLatestReadingDateTime(patient.readings)).valueOf()
  );
};

//~~~~~~~ Calculate Age based on DOB ~~~~~~~~~~
export const getAgeBasedOnDOB = (value: string) => {
  return moment().diff(value, 'years');
};

export const getAgeToDisplay = (dob: string, isExactDob: boolean) => {
  if (isExactDob) {
    return moment().diff(dob, 'years');
  }
  return `${moment().diff(dob, 'years')} (estimated)`;
};

export const getDOBForEstimatedAge = (age: number) => {
  return moment()
    .subtract(age + 0.5, 'years')
    .format('YYYY-MM-DD');
};

export const GESTATIONAL_AGE_UNITS = {
  WEEKS: `GESTATIONAL_AGE_UNITS_WEEKS`,
  MONTHS: `GESTATIONAL_AGE_UNITS_MONTHS`,
};

export const INITIAL_URINE_TESTS = {
  urineTestNit: ``,
  urineTestBlood: ``,
  urineTestLeuc: ``,
  urineTestPro: ``,
  urineTestGlu: ``,
};

export const URINE_TEST_CHEMICALS = {
  LEUC: `Leukocytes`,
  NIT: `Nitrites`,
  GLU: `Glucose`,
  PRO: `Protein`,
  BLOOD: `Blood`,
};

export const monthsToWeeks = (value: string): string => {
  return `${Number(value) * 4}`;
};

export const weeksToMonths = (value: string): string => {
  const rawValue = Math.floor(Number(value) / 4);
  return `${Math.max(1, rawValue)}`;
};

enum GestationLimitsEnum {
  WEEKS = 43,
  MONTHS = 10,
}

export const gestationalAgeValueWeekOptions = new Array(
  GestationLimitsEnum.WEEKS
)
  .fill(null)
  .map((_: null, index: number) => ({
    label: `${index + 1}`,
    value: `${index + 1}`,
  }));

export const gestationalAgeValueMonthOptions = new Array(
  GestationLimitsEnum.MONTHS
)
  .fill(null)
  .map((_: null, index: number) => ({
    label: `${index + 1}`,
    value: `${index + 1}`,
  }))
  .concat([
    {
      label: `Less than 1 month`,
      value: `Less than 1`,
    },
  ])
  .sort((first: { label: string }, second: { label: string }): number => {
    if (first.label === `Less than 1 month`) {
      return -1;
    }

    if (second.label === `Less than 1 month`) {
      return 1;
    }

    return Number(first.label) - Number(second.label);
  });
