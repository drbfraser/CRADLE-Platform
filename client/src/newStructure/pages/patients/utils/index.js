import { getMomentDate } from '../../../shared/utils';

export const getPrettyDateTime = (dateStr) => {
  return getMomentDate(dateStr).format('MMMM Do YYYY, h:mm:ss a');
};
