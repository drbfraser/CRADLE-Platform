import { Reading } from 'src/shared/types/readingTypes';
import { TrafficLightEnum } from 'src/shared/enums';
import { getMomentDate } from './date';

export const calculateShockIndex = (reading: Reading): TrafficLightEnum => {
  const RED_SYSTOLIC = 160;
  const RED_DIASTOLIC = 110;
  const YELLOW_SYSTOLIC = 140;
  const YELLOW_DIASTOLIC = 90;
  const SHOCK_HIGH = 1.7;
  const SHOCK_MEDIUM = 0.9;

  if (
    reading.systolicBloodPressure === undefined ||
    reading.diastolicBloodPressure === undefined ||
    reading.heartRate === undefined
  ) {
    return TrafficLightEnum.NONE;
  }

  const shockIndex = reading.heartRate / reading.systolicBloodPressure;

  const isBpVeryHigh =
    reading.systolicBloodPressure >= RED_SYSTOLIC ||
    reading.diastolicBloodPressure >= RED_DIASTOLIC;

  const isBpHigh =
    reading.systolicBloodPressure >= YELLOW_SYSTOLIC ||
    reading.diastolicBloodPressure >= YELLOW_DIASTOLIC;

  const isSevereShock = shockIndex >= SHOCK_HIGH;
  const isShock = shockIndex >= SHOCK_MEDIUM;

  if (isSevereShock) {
    return TrafficLightEnum.RED_DOWN;
  }
  if (isBpVeryHigh) {
    return TrafficLightEnum.RED_UP;
  }
  if (isShock) {
    return TrafficLightEnum.YELLOW_DOWN;
  }
  if (isBpHigh) {
    return TrafficLightEnum.YELLOW_UP;
  }

  return TrafficLightEnum.GREEN;
};

export const getLatestReading = (readings: Array<Reading>): Reading => {
  const sortedReadings = readings.sort(
    (reading: Reading, otherReading: Reading) =>
      getMomentDate(otherReading.dateTaken).valueOf() -
      getMomentDate(reading.dateTaken).valueOf()
  );
  return sortedReadings[0];
};
