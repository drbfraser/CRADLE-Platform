import { getNumOfMonths, getNumOfWeeksDays } from 'src/shared/utils';

export enum FormStatusEnum {
  ADD_NEW_READING = 1,
  EDIT_PATIENT_INFORMATION,
  ADD_ASSESSMENT,
  UPDATE_ASSESSMENT,
}

export enum SexEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export const sexOptions = {
  [SexEnum.MALE]: 'Male',
  [SexEnum.FEMALE]: 'Female',
};

export enum GestationalAgeUnitEnum {
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS',
}

export const gestationalAgeUnitLabels = {
  [GestationalAgeUnitEnum.WEEKS]: 'Weeks + Days',
  [GestationalAgeUnitEnum.MONTHS]: 'Months',
};

export const gestationalAgeUnitFormatters = {
  [GestationalAgeUnitEnum.WEEKS]: getNumOfWeeksDays,
  [GestationalAgeUnitEnum.MONTHS]: getNumOfMonths,
};

export enum TrafficLightEnum {
  GREEN = 'GREEN',
  YELLOW_UP = 'YELLOW_UP',
  YELLOW_DOWN = 'YELLOW_DOWN',
  RED_UP = 'RED_UP',
  RED_DOWN = 'RED_DOWN',
  NONE = 'NONE',
}

export const trafficLightColors = {
  [TrafficLightEnum.GREEN]: '#8ACA55',
  [TrafficLightEnum.YELLOW_UP]: '#E6DA4F',
  [TrafficLightEnum.YELLOW_DOWN]: '#E6B74F',
  [TrafficLightEnum.RED_UP]: '#E6574F',
  [TrafficLightEnum.RED_DOWN]: '#D6272F',
  [TrafficLightEnum.NONE]: 'rgba(0,0,0,0)',
};

export enum UserRoleEnum {
  VHT = 'VHT',
  CHO = 'CHO',
  HCW = 'HCW',
  ADMIN = 'ADMIN',
}

export const userRoles = {
  [UserRoleEnum.VHT]: 'VHT',
  [UserRoleEnum.CHO]: 'CHO',
  [UserRoleEnum.HCW]: 'HCW',
  [UserRoleEnum.ADMIN]: 'Admin',
};

export enum PatientStateEnum {
  ADD = 'Add',
  ADDED = 'Added',
  ADDING = 'Adding...',
  JUST_ADDED = 'Just added',
}

export enum SortOrderEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SymptomEnum {
  NONE = 'None',
  HEADACHE = 'Headache',
  BLURRED_VISION = 'Blurred vision',
  ABDOMINAL_PAIN = 'Abdominal pain',
  BLEEDING = 'Bleeding',
  FEVERISH = 'Feverish',
  UNWELL = 'Unwell',
  OTHER = 'Other',
}

export enum MonthEnum {
  JANUARY = 'Jan',
  FEBRUARY = 'Feb',
  MARCH = 'Mar',
  APRIL = 'Apr',
  MAY = 'May',
  JUNE = 'Jun',
  JULY = 'Jul',
  AUGUST = 'Aug',
  SEPTEMBER = 'Sep',
  OCTOBER = 'Oct',
  NOVEMBER = 'Nov',
  DECEMBER = 'Dec',
}
