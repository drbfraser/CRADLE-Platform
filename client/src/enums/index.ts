export enum FormStatusEnum {
  ADD_NEW_READING = 1,
  EDIT_PATIENT_INFORMATION,
  ADD_ASSESSMENT,
  UPDATE_ASSESSMENT,
}

export enum SexEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum GestationalAgeUnitEnum {
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS',
}

export enum GestationalAgeUnitDisplayEnum {
  WEEKS = 'Weeks',
  MONTHS = 'Months',
}

export enum TrafficLightEnum {
  GREEN = 'GREEN',
  YELLOW_UP = 'YELLOW_UP',
  YELLOW_DOWN = 'YELLOW_DOWN',
  RED_UP = 'RED_UP',
  RED_DOWN = 'RED_DOWN',
  NONE = 'NONE',
}

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
