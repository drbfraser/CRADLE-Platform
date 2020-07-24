import { OrNull, Patient, Reading } from '@types';

import { ReactComponent as GreenTraffic } from '../drawable/green.svg';
import { Icon } from 'semantic-ui-react';
import React from 'react';
import { ReactComponent as RedTraffic } from '../drawable/red.svg';
import { TrafficLightEnum } from '../../../../enums';
import { ReactComponent as YellowTraffic } from '../drawable/yellow.svg';
import { getMomentDate } from '../../../../shared/utils';

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

export const average = (monthlyArray: Array<number>): number => {
  return (
    monthlyArray.reduce((total: number, value: number): number => {
      return total + value;
    }, 0) / monthlyArray.length
  );
};

export const sortReadings = (readings: Array<Reading>) => {
  return readings.sort(
    (reading, otherReading) =>
      getMomentDate(otherReading.dateTimeTaken).valueOf() -
      getMomentDate(reading.dateTimeTaken).valueOf()
  );
};

export const calculateShockIndex = (
  reading: Reading
): `NONE` | `RED_DOWN` | `RED_UP` | `YELLOW_DOWN` | `YELLOW_UP` | `GREEN` => {
  const RED_SYSTOLIC = 160;
  const RED_DIASTOLIC = 110;
  const YELLOW_SYSTOLIC = 140;
  const YELLOW_DIASTOLIC = 90;
  const SHOCK_HIGH = 1.7;
  const SHOCK_MEDIUM = 0.9;

  if (
    reading[`bpSystolic`] === undefined ||
    reading[`bpDiastolic`] === undefined ||
    reading[`heartRateBPM`] === undefined
  ) {
    return `NONE`;
  }

  const shockIndex = reading[`heartRateBPM`] / reading[`bpSystolic`];

  const isBpVeryHigh =
    reading[`bpSystolic`] >= RED_SYSTOLIC ||
    reading[`bpDiastolic`] >= RED_DIASTOLIC;

  const isBpHigh =
    reading[`bpSystolic`] >= YELLOW_SYSTOLIC ||
    reading[`bpDiastolic`] >= YELLOW_DIASTOLIC;

  const isSevereShock = shockIndex >= SHOCK_HIGH;

  const isShock = shockIndex >= SHOCK_MEDIUM;

  if (isSevereShock) {
    return `RED_DOWN`;
  } else if (isBpVeryHigh) {
    return `RED_UP`;
  } else if (isShock) {
    return `YELLOW_DOWN`;
  } else if (isBpHigh) {
    return `YELLOW_UP`;
  } else {
    return `GREEN`;
  }
};

export const getReferralIds = (patient: OrNull<Patient>): Array<string> => {
  return (
    patient?.readings?.reduce(
      (referralIds: Array<string>, { referral }: Reading): Array<string> => {
        return referral === null ? referralIds : [...referralIds, referral];
      },
      []
    ) ?? []
  );
};

export const unitOptions = [
  { key: `weeks`, text: `Weeks`, value: 1 },
  { key: `months`, text: `Months`, value: 2 },
];

export const guid = (): string => {
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(
    /[xy]/g,
    (character: string): string => {
      const random = (Math.random() * 16) | 0;
      const value = character === 'x' ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    }
  );
};

export const getNumOfWeeks = (timestamp: number): number => {
  const todaysDate = new Date();
  const gestDate = new Date(timestamp * 1000);
  const difference = todaysDate.getTime() - gestDate.getTime();
  return Math.round(difference / (7 * 24 * 60 * 60 * 1000));
};

export const getNumOfMonths = (timestamp: number): number | string => {
  const todaysDate = new Date();
  const gestDate = new Date(timestamp * 1000);
  const numOfMonths =
    todaysDate.getMonth() -
    gestDate.getMonth() +
    12 * (todaysDate.getFullYear() - gestDate.getFullYear());

  return numOfMonths === 0 ? `< 1` : numOfMonths;
};

export const getTrafficIcon = (trafficLightStatus: any): JSX.Element => {
  if (trafficLightStatus === `RED_DOWN`) {
    return (
      <div>
        <RedTraffic style={{ height: `65px`, width: `65px` }} />
        <Icon name="arrow down" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === `RED_UP`) {
    return (
      <div>
        <RedTraffic style={{ height: `65px`, width: `65px` }} />
        <Icon name="arrow up" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === `YELLOW_UP`) {
    return (
      <div>
        <YellowTraffic style={{ height: `65px`, width: `65px` }} />
        <Icon name="arrow up" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === `YELLOW_DOWN`) {
    return (
      <div>
        <YellowTraffic style={{ height: `65px`, width: `65px` }} />
        <Icon name="arrow down" size="huge" />
      </div>
    );
  } else {
    return <GreenTraffic style={{ height: `65px`, width: `65px` }} />;
  }
};

export const getLatestReading = (readings: Array<Reading>): Reading => {
  const sortedReadings = readings.sort(
    (a, b) =>
      getMomentDate(b.dateTimeTaken).valueOf() -
      getMomentDate(a.dateTimeTaken).valueOf()
  );
  return sortedReadings[0];
};

export const getLatestReadingDateTime = (
  readings: Array<Reading>
): OrNull<number> => {
  return getLatestReading(readings).dateTimeTaken;
};

export const sortPatientsByLastReading = (
  patient: Patient,
  otherPatient: Patient
): number => {
  return (
    getMomentDate(getLatestReadingDateTime(otherPatient.readings)).valueOf() -
    getMomentDate(getLatestReadingDateTime(patient.readings)).valueOf()
  );
};
