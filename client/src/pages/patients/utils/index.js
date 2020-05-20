import { getLatestReading, getMomentDate } from '../../../shared/utils';

export const getLatestReadingDateTime = (readings) => {
  return getLatestReading(readings).dateTimeTaken;
};

export const getPrettyDateTime = (dateStr) => {
  return getMomentDate(dateStr).format('MMMM Do YYYY, h:mm:ss a');
};
