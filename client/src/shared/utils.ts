import { OrNull, Reading } from 'src/shared/types';

import { TrafficLightEnum } from 'src/shared/enums';
import moment from 'moment';
import { history } from 'src/redux/reducers/index';

export { v4 as makeUniqueId } from 'uuid';

export const getTimestampFromWeeksDays = (
  weeks: string,
  days: string
): number => {
  const weeksInMillis = Number(weeks) * 7 * 24 * 60 * 60 * 1000;
  const daysInMillis = Number(days) * 24 * 60 * 60 * 1000;
  const timestampMillis = new Date().getTime() - weeksInMillis - daysInMillis;
  const timestampSecs = timestampMillis / 1000;
  return timestampSecs;
};

export const getTimestampFromWeeksDaysWithEndDate = (
  weeks: string,
  days: string,
  endDate: string
): number => {
  const weeksInSeconds = Number(weeks) * 7 * 24 * 60 * 60;
  const daysInSeconds = Number(days) * 24 * 60 * 60;
  const timestamp = Number(endDate) - weeksInSeconds - daysInSeconds;
  return timestamp;
};

export const getTimestampFromWeeks = (weeks: string): number => {
  const weeksInMillis = Number(weeks) * 7 * 24 * 60 * 60 * 1000;
  const timestampMillis = new Date().getTime() - weeksInMillis;
  const timestampSecs = timestampMillis / 1000;
  return timestampSecs;
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

export const getTimestampFromMonthsWithEndDate = (
  months: string,
  endDate: string
): number => {
  if (months === `Less than 1`) {
    return Number(endDate);
  }
  const timestampSecs = Number(endDate) - Number(months) * 4 * 7 * 24 * 60 * 60;
  return timestampSecs;
};

//Original string date format MUST be 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm:ss'
export const getTimestampFromStringDate = (strDate: string): number => {
  const utcDate = moment(strDate);
  return utcDate.toDate().getTime() * 0.001;
};

export const getNumOfWeeksDaysNumeric = (
  startTime: number,
  endTime: OrNull<number>
) => {
  const endDate = endTime ? new Date(endTime * 1000) : new Date();
  const startDate = new Date(startTime * 1000);
  const difference = endDate.getTime() - startDate.getTime();
  const totalDays = Math.round(difference / (24 * 60 * 60 * 1000));
  const weeks = Math.floor(totalDays / 7);

  return {
    weeks: weeks,
    days: totalDays % 7,
  };
};

export const getNumOfWeeksDays = (
  startTime: number,
  endTime: OrNull<number>
): string => {
  const { weeks, days } = getNumOfWeeksDaysNumeric(startTime, endTime);

  if (weeks === 0) {
    if (days === 0) {
      return 'Less than a day';
    } else {
      return `${days} day(s)`;
    }
  }

  return `${weeks} week(s) and ${days} day(s)`;
};

export const getNumOfWeeksNumeric = (timestamp: number): number => {
  const todaysDate = new Date();
  const timestampDate = new Date(timestamp * 1000);
  const difference = todaysDate.getTime() - timestampDate.getTime();
  return Math.round(difference / (7 * 24 * 60 * 60 * 1000));
};

export const getNumOfWeeks = (timestamp: number): string => {
  const numOfWeeks = getNumOfWeeksNumeric(timestamp);
  if (numOfWeeks === 0) {
    return 'Less than 1 week';
  }

  return `${numOfWeeks} weeks(s)`;
};

export const getNumOfMonthsNumeric = (
  startTime: number,
  endTime: OrNull<number>
): number => {
  const endDate = endTime ? new Date(endTime * 1000) : new Date();
  const startDate = new Date(startTime * 1000);
  const difference = endDate.getTime() - startDate.getTime();
  const numOfMonths = Math.floor(difference / (4 * 7 * 24 * 60 * 60 * 1000));

  return numOfMonths;
};

export const getNumOfMonths = (
  startTime: number,
  endTime: OrNull<number>
): string => {
  const numOfMonths = getNumOfMonthsNumeric(startTime, endTime);
  if (numOfMonths === 0) {
    return 'Less than 1 month';
  }

  return `${numOfMonths} month(s)`;
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
  // Dates are stored in the backend in UTC time
  return moment.utc(dateS ?? 0);
};

export const getPrettyDate = (dateStr: number): string => {
  // * Date comes in from the backend in seconds
  // * Moment date requires milliseconds
  return getMomentDate(dateStr * 1000).format('YYYY-MM-DD');
};

export const getPrettyDateTime = (dateStr: number): string => {
  // * Date comes in from the backend in seconds
  // * Moment date requires milliseconds
  return getMomentDate(dateStr * 1000)
    .local()
    .format('YYYY-MM-DD HH:mm:ss');
};

export const getYearToDisplay = (timestamp: number) => {
  return getMomentDate(timestamp * 1000).format('YYYY');
};

export const getLatestReading = (readings: Array<Reading>): Reading => {
  const sortedReadings = readings.sort(
    (reading: Reading, otherReading: Reading) =>
      getMomentDate(otherReading.dateTimeTaken).valueOf() -
      getMomentDate(reading.dateTimeTaken).valueOf()
  );
  return sortedReadings[0];
};

export const getAgeBasedOnDOB = (value: string) => {
  return Math.trunc(moment().diff(value, 'years', true));
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
  } else {
    history.replace(fallbackUrl);
  }
};

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
