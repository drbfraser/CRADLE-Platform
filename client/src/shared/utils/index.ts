import { OrNull, OrUndefined, Reading } from 'src/types';

import { TrafficLightEnum } from 'src/enums';
import moment from 'moment';
import { history } from 'src/redux/reducers/index';

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

export const getWeeksDays = (timestamp: number): string => {
  const todaysDate = new Date();
  const timestampDate = new Date(timestamp * 1000);
  const difference = todaysDate.getTime() - timestampDate.getTime();
  let days = Math.round(difference / (24 * 60 * 60 * 1000));

  if(days === 0) {
    return 'Less than a day';
  }

  if(days < 7) {
    return `${days} day(s)`
  }

  const weeks = Math.floor(days / 7);
  days = days % 7;

  return `${weeks} week(s) and ${days} day(s)`
}

export const getNumOfWeeksNumeric = (timestamp: number): number => {
  const todaysDate = new Date();
  const timestampDate = new Date(timestamp * 1000);
  const difference = todaysDate.getTime() - timestampDate.getTime();
  return Math.round(difference / (7 * 24 * 60 * 60 * 1000));
};

export const getNumOfWeeks = (timestamp: number): string => {
  const numOfWeeks = getNumOfWeeksNumeric(timestamp);
  if(numOfWeeks === 0) {
    return 'Less than 1 week'
  }

  return `${numOfWeeks} weeks(s)`
}

export const getNumOfMonthsNumeric = (timestamp: number): number => {
  const todaysDate = new Date();
  const timestampDate = new Date(timestamp * 1000);
  const difference = todaysDate.getTime() - timestampDate.getTime();
  const numOfMonths = Math.floor(difference / (4 * 7 * 24 * 60 * 60 * 1000));

  return numOfMonths;
};

export const getNumOfMonths = (timestamp: number): string => {
  const numOfMonths = getNumOfMonthsNumeric(timestamp);
  if(numOfMonths === 0) {
    return 'Less than 1 month'
  }

  return `${numOfMonths} month(s)`
};

// Function is not currently used but has a high likelihood of being useful in the future
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

export const getPrettyDateTime = (dateStr: number): string => {
  // * Date comes in from the backend in seconds
  // * Moment date requires milliseconds
  return getMomentDate(dateStr * 1000).format('YYYY-MM-DD');
};

export const getLatestReading = (readings: Array<Reading>): Reading => {
  const sortedReadings = readings.sort(
    (reading: Reading, otherReading: Reading) =>
      getMomentDate(otherReading.dateTimeTaken).valueOf() -
      getMomentDate(reading.dateTimeTaken).valueOf()
  );
  return sortedReadings[0];
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

export const goBackWithFallback = (fallbackUrl: string) => {
  // browser new tab page + this page = 2, need more than 2 to go back
  if (history.length > 2) {
    history.goBack();
  }

  history.replace(fallbackUrl);
};
