import { getLatestReading } from '../../../../shared/utils';

export const getLatestReadingDateTime = (readings) => {
  return getLatestReading(readings).dateTimeTaken;
};

export const trafficLights = [
  `GREEN`,
  `YELLOW_UP`,
  `YELLOW_DOWN`,
  `RED_UP`,
  `RED_DOWN`,
];
