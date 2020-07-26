import { OrNull, Reading } from '@types';

import { TrafficLightEnum } from '../../../../../../enums';
import { getMomentDate } from '../../../../../../shared/utils';

export const createReadings = (
  readingId: string,
  dateTimeTaken: OrNull<number>,
  bpDiastolic: number,
  bpSystolic: number,
  heartRateBPM: number,
  symptoms: string,
  trafficLightStatus: TrafficLightEnum,
  isReferred: boolean,
  drugHistory: any,
  medicalHistory: any,
  urineTests: any,
  dateReferred?: number
): any => {
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

export const createReadingObject = (reading: any): any => {
  const readingId = reading.readingId;
  const dateTimeTaken = reading.dateTimeTaken;
  const bpDiastolic = reading.bpDiastolic;
  const bpSystolic = reading.bpSystolic;
  const heartRateBPM = reading.heartRateBPM;
  const symptoms = reading.symptoms;
  const trafficLightStatus = reading.trafficLightStatus;
  const isReferred = reading.referral ? true : false;
  const dateReferred = reading.dateReferred;
  const medicalHistory = reading.medicalHistory;
  const drugHistory = reading.drugHistory;
  const urineTests = reading.urineTests;

  return createReadings(
    readingId,
    dateTimeTaken,
    bpDiastolic,
    bpSystolic,
    heartRateBPM,
    symptoms,
    trafficLightStatus,
    isReferred,
    medicalHistory,
    drugHistory,
    urineTests,
    dateReferred
  );
};

export const sortReadings = (readings: Array<Reading>) => {
  return readings.sort(
    (reading, otherReading) =>
      getMomentDate(otherReading.dateTimeTaken).valueOf() -
      getMomentDate(reading.dateTimeTaken).valueOf()
  );
};
