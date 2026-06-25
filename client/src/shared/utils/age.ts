import moment from 'moment';
import { DATE_FORMAT } from './date';

export const getAgeBasedOnDOB = (value: string) => {
  return Math.floor(moment().diff(value, 'years', true));
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
    .format(DATE_FORMAT);
};
