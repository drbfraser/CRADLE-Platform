import { getMomentDate } from '../../../../shared/utils';

export const getLatestReferral = (readings:any) => {
  let sortedReadings = readings.sort(
    (a:any, b:any) =>
      getMomentDate(b.dateTimeTaken).valueOf() -
      getMomentDate(a.dateTimeTaken).valueOf()
  );

  if (sortedReadings[0].dateReferred) {
    return sortedReadings[0].dateReferred;
  } else {
    return '';
  }
};

export const sortReferralsByDate = (a:any, b:any) =>
  getMomentDate(getLatestReferral(b.readings)).valueOf() -
  getMomentDate(getLatestReferral(a.readings)).valueOf();
