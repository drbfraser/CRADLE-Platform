import { OrNull, Patient, Reading } from '@types';

import { ReactComponent as GreenTraffic } from '../drawable/green.svg';
import { Icon } from 'semantic-ui-react';
import React from 'react';
import { ReactComponent as RedTraffic } from '../drawable/red.svg';
import { ReactComponent as YellowTraffic } from '../drawable/yellow.svg';
import { getMomentDate } from '../../../../shared/utils';

export const average = (monthlyArray: Array<number>): number => {
  return (
    monthlyArray.reduce((total: number, value: number): number => {
      return total + value;
    }, 0) / monthlyArray.length
  );
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
