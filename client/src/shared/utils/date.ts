import moment from 'moment';
import { OrNull } from 'src/shared/types/types';
import { ISODate } from 'src/shared/constants';

export const DATE_FORMAT = 'YYYY-MM-DD';

export const formatDate = (d?: string) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getTimestampFromWeeksDays = (
  weeks: string,
  days: string
): number => {
  const weeksInMillis = Number(weeks) * 7 * 24 * 60 * 60 * 1000;
  const daysInMillis = Number(days) * 24 * 60 * 60 * 1000;
  const timestampMillis = new Date().getTime() - weeksInMillis - daysInMillis;
  return timestampMillis / 1000;
};

export const getTimestampFromWeeksDaysWithEndDate = (
  weeks: string,
  days: string,
  endDate: string
): number => {
  const weeksInSeconds = Number(weeks) * 7 * 24 * 60 * 60;
  const daysInSeconds = Number(days) * 24 * 60 * 60;
  return Number(endDate) - weeksInSeconds - daysInSeconds;
};

export const getTimestampFromWeeks = (weeks: string): number => {
  const weeksInMillis = Number(weeks) * 7 * 24 * 60 * 60 * 1000;
  const timestampMillis = new Date().getTime() - weeksInMillis;
  return timestampMillis / 1000;
};

export const getTimestampFromMonths = (months: string): number => {
  if (months === 'Less than 1') {
    return Date.now() / 1000;
  }

  const gestationalDate = new Date();
  gestationalDate.setTime(
    gestationalDate.getTime() - Number(months) * 4 * 7 * 24 * 60 * 60 * 1000
  );

  return gestationalDate.getTime() / 1000;
};

export const getTimestampFromMonthsWithEndDate = (
  months: string,
  endDate: string
): number => {
  if (months === 'Less than 1') {
    return Number(endDate);
  }
  return Number(endDate) - Number(months) * 4 * 7 * 24 * 60 * 60;
};

export const getTimestampFromStringDate = (strDate: string): number => {
  return moment(strDate).toDate().getTime() * 0.001;
};

export function formatISODateNumber(isoDateNumber: number): ISODate {
  return new Date(isoDateNumber * 1000).toLocaleDateString('en-CA');
}

export function formatISODateNumberWithTime(isoDateNumber: number): ISODate {
  return new Date(isoDateNumber * 1000).toLocaleString('en-CA');
}

export function getDateFromStringTimestamp(strDate: string): string {
  const idx = strDate.indexOf(',');
  return idx === -1 ? strDate : strDate.slice(0, idx);
}

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
    weeks,
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
    }
    return `${days} day(s)`;
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
  return Math.floor(difference / (4 * 7 * 24 * 60 * 60 * 1000));
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

export const getMomentDate = (dateS: OrNull<number>): moment.Moment => {
  const timestamp = dateS ?? 0;
  const timestampInMs =
    timestamp.toString().length <= 10 ? timestamp * 1000 : timestamp;
  return moment.utc(timestampInMs);
};

export const getPrettyDate = (dateStr: number): string => {
  const timestampInMs =
    dateStr.toString().length <= 10 ? dateStr * 1000 : dateStr;
  return getMomentDate(timestampInMs).local().format(DATE_FORMAT);
};

export const getPrettyDateTime = (dateStr: number): string => {
  if (dateStr === undefined || dateStr === null) {
    return 'N/A';
  }
  const timestampInMs =
    dateStr.toString().length <= 10 ? dateStr * 1000 : dateStr;
  return getMomentDate(timestampInMs).local().format(`${DATE_FORMAT} HH:mm:ss`);
};

export const getYearToDisplay = (timestamp: number) => {
  return getMomentDate(timestamp * 1000).local().format('YYYY');
};
