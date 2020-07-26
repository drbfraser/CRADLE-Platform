import { ReactComponent as GreenTraffic } from '../icons/green.svg';
import { Icon } from 'semantic-ui-react';
import React from 'react';
import { Reading } from '@types';
import { ReactComponent as RedTraffic } from '../icons/red.svg';
import { TrafficLightEnum } from '../../enums';
import { ReactComponent as YellowTraffic } from '../icons/yellow.svg';
import classes from './styles.module.css';
import moment from 'moment';

export { v4 as makeUniqueId } from 'uuid';

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

export const getMomentDate = (dateS: any) => {
  return moment(dateS * 1000);
};

export const getPrettyDate = (dateStr: any) => {
  return getMomentDate(dateStr).format('MMMM Do YYYY');
};

export const getPrettyDateTime = (dateStr: any) => {
  return getMomentDate(dateStr).format('MMMM Do YYYY, h:mm:ss a');
};

export const getPrettyDateYYYYmmDD = (dateStr: any) => {
  return moment(String(dateStr)).format('MMMM Do YYYY');
};

export const getLatestReading = (readings: any) => {
  const sortedReadings = readings.sort(
    (a: any, b: any) =>
      getMomentDate(b.dateTimeTaken).valueOf() -
      getMomentDate(a.dateTimeTaken).valueOf()
  );
  return sortedReadings[0];
};

export const getLatestReadingDateTime = (readings: any) => {
  return getLatestReading(readings).dateTimeTaken;
};

export const sortPatientsByLastReading = (a: any, b: any) =>
  getMomentDate(getLatestReadingDateTime(b.readings)).valueOf() -
  getMomentDate(getLatestReadingDateTime(a.readings)).valueOf();

export const getTrafficIcon = (trafficLightStatus: any) => {
  if (trafficLightStatus === 'RED_DOWN') {
    return (
      <div>
        <RedTraffic className={classes.trafficLight} />
        <Icon name="arrow down" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === 'RED_UP') {
    return (
      <div>
        <RedTraffic className={classes.trafficLight} />
        <Icon name="arrow up" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === 'YELLOW_UP') {
    return (
      <div>
        <YellowTraffic className={classes.trafficLight} />
        <Icon name="arrow up" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === 'YELLOW_DOWN') {
    return (
      <div>
        <YellowTraffic className={classes.trafficLight} />
        <Icon name="arrow down" size="huge" />
      </div>
    );
  } else {
    return <GreenTraffic className={classes.trafficLight} />;
  }
};

export const GESTATIONAL_AGE_UNITS = {
  WEEKS: `GESTATIONAL_AGE_UNITS_WEEKS`,
  MONTHS: `GESTATIONAL_AGE_UNITS_MONTHS`,
};

export const INITIAL_URINE_TESTS = {
  urineTestNit: ``,
  urineTestBlood: ``,
  urineTestLeuc: ``,
  urineTestPro: ``,
  urineTestGlu: ``,
};

export const URINE_TEST_CHEMICALS = {
  LEUC: `Leukocytes`,
  NIT: `Nitrites`,
  GLU: `Glucose`,
  PRO: `Protein`,
  BLOOD: `Blood`,
};

export const monthsToWeeks = (value: string): string => {
  return `${Number(value) * 4}`;
};

export const weeksToMonths = (value: string): string => {
  const rawValue = Math.floor(Number(value) / 4);
  return `${Math.max(1, rawValue)}`;
};

enum GestationLimitsEnum {
  WEEKS = 43,
  MONTHS = 10,
}

export const gestationalAgeValueWeekOptions = new Array(
  GestationLimitsEnum.WEEKS
)
  .fill(null)
  .map((_: null, index: number) => ({
    key: `${index + 1}`,
    text: `${index + 1}`,
    value: `${index + 1}`,
  }));

export const gestationalAgeValueMonthOptions = new Array(
  GestationLimitsEnum.MONTHS
)
  .fill(null)
  .map((_: null, index: number) => ({
    key: `${index + 1}`,
    text: `${index + 1}`,
    value: `${index + 1}`,
  }));
