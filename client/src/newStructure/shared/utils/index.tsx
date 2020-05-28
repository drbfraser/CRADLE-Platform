import { ReactComponent as GreenTraffic } from '../icons/green.svg';
import { Icon } from 'semantic-ui-react';
import React from 'react';
import { ReactComponent as RedTraffic } from '../icons/red.svg';
import { ReactComponent as YellowTraffic } from '../icons/yellow.svg';
import moment from 'moment';

export const getMomentDate = (dateS: any) => {
  return moment(dateS * 1000);
};

export const getPrettyDate = (dateStr: any) => {
  return getMomentDate(dateStr).format('MMMM Do YYYY');
};

export const getPrettyDateTime = (dateStr: any) => {
  return getMomentDate(dateStr).format('MMMM Do YYYY, h:mm:ss a');
};

export const getLatestReading = (readings: any) => {
  let sortedReadings = readings.sort(
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
        <RedTraffic style={{ height: 60, width: 60 }} />
        <Icon name="arrow down" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === 'RED_UP') {
    return (
      <div>
        <RedTraffic style={{ height: 60, width: 60 }} />
        <Icon name="arrow up" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === 'YELLOW_UP') {
    return (
      <div>
        <YellowTraffic style={{ height: 60, width: 60 }} />
        <Icon name="arrow up" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === 'YELLOW_DOWN') {
    return (
      <div>
        <YellowTraffic style={{ height: 60, width: 60 }} />
        <Icon name="arrow down" size="huge" />
      </div>
    );
  } else {
    return <GreenTraffic style={{ height: 60, width: 60 }} />;
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
