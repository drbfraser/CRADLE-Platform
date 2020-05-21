import { ReactComponent as GreenTraffic } from '../icons/green.svg';
import { Icon } from 'semantic-ui-react';
import { ReactComponent as RedTraffic } from '../icons/red.svg';
import { ReactComponent as YellowTraffic } from '../icons/yellow.svg';
import moment from 'moment';

export const getMomentDate = (dateS) => {
  return moment(dateS * 1000);
};

export const getPrettyDate = (dateStr) => {
  return getMomentDate(dateStr).format('MMMM Do YYYY');
};

export const getPrettyDateTime = (dateStr) => {
  return getMomentDate(dateStr).format('MMMM Do YYYY, h:mm:ss a');
};

export const getLatestReading = (readings) => {
  let sortedReadings = readings.sort(
    (a, b) =>
      getMomentDate(b.dateTimeTaken).valueOf() -
      getMomentDate(a.dateTimeTaken).valueOf()
  );
  return sortedReadings[0];
};

export const sortPatientsByLastReading = (a, b) =>
  getMomentDate(getLatestReadingDateTime(b.readings)).valueOf() -
  getMomentDate(getLatestReadingDateTime(a.readings)).valueOf();

export const getTrafficIcon = (trafficLightStatus) => {
  if (trafficLightStatus === 'RED_DOWN') {
    return (
      <div>
        <RedTraffic style={{ height: '65px', width: '65px' }} />
        <Icon name="arrow down" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === 'RED_UP') {
    return (
      <div>
        <RedTraffic style={{ height: '65px', width: '65px' }} />
        <Icon name="arrow up" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === 'YELLOW_UP') {
    return (
      <div>
        <YellowTraffic style={{ height: '65px', width: '65px' }} />
        <Icon name="arrow up" size="huge" />
      </div>
    );
  } else if (trafficLightStatus === 'YELLOW_DOWN') {
    return (
      <div>
        <YellowTraffic style={{ height: '65px', width: '65px' }} />
        <Icon name="arrow down" size="huge" />
      </div>
    );
  } else {
    return <GreenTraffic style={{ height: '65px', width: '65px' }} />;
  }
};
