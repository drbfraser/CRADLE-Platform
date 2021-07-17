import {
  getNumOfMonths,
  getNumOfWeeksDays,
  getTimestampFromMonthsWithEndDate,
  getTimestampFromWeeksDaysWithEndDate,
  getTimestampFromMonths,
  getTimestampFromWeeksDays,
} from 'src/shared/utils';
import {
  GestationalAgeUnitEnum,
  SexEnum,
  TrafficLightEnum,
  UserRoleEnum,
} from './enums';

export const gestationalAgeUnitLabels = {
  [GestationalAgeUnitEnum.WEEKS]: 'Weeks + Days',
  [GestationalAgeUnitEnum.MONTHS]: 'Months',
};

export const gestationalAgeUnitFormatters = {
  [GestationalAgeUnitEnum.WEEKS]: getNumOfWeeksDays,
  [GestationalAgeUnitEnum.MONTHS]: getNumOfMonths,
};

export const gestationalAgeUnitTimestamp = {
  [GestationalAgeUnitEnum.WEEKS]: getTimestampFromWeeksDays,
  [GestationalAgeUnitEnum.MONTHS]: getTimestampFromMonths,
};

export const gestationalAgeUnitTimestampWithEndDate = {
  [GestationalAgeUnitEnum.WEEKS]: getTimestampFromWeeksDaysWithEndDate,
  [GestationalAgeUnitEnum.MONTHS]: getTimestampFromMonthsWithEndDate,
};

export const sexOptions = {
  [SexEnum.MALE]: 'Male',
  [SexEnum.FEMALE]: 'Female',
};

export const trafficLightColors = {
  [TrafficLightEnum.GREEN]: '#8ACA55',
  [TrafficLightEnum.YELLOW_UP]: '#E6DA4F',
  [TrafficLightEnum.YELLOW_DOWN]: '#E6B74F',
  [TrafficLightEnum.RED_UP]: '#E6574F',
  [TrafficLightEnum.RED_DOWN]: '#D6272F',
  [TrafficLightEnum.NONE]: 'rgba(0,0,0,0)',
};

export const userRoleLabels = {
  [UserRoleEnum.VHT]: 'VHT',
  [UserRoleEnum.CHO]: 'CHO',
  [UserRoleEnum.HCW]: 'HCW',
  [UserRoleEnum.ADMIN]: 'Admin',
};
