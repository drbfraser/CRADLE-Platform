// * Role ids start from 1 to 4 in the order below
// * Order must be maintained for use in edit user form
// * in the admin page
export enum UserOptionEnum {
  VHT = 1,
  HCW = 2,
  ADMIN = 3,
  CHO = 4,
}

export enum UserOptionDisplayEnum {
  VHT = 'VHT',
  HCW = 'HCW',
  CHO = 'CHO',
  ADMIN = 'ADMIN',
}

export enum YesNoEnum {
  YES = 1,
  NO = 0,
}

export enum YesNoDisplayEnum {
  YES = 'Yes',
  NO = 'No',
}

export enum SexEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum SexDisplayEnum {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum GestationalAgeUnitDisplayEnum {
  WEEKS = 'Weeks',
  MONTHS = 'Months',
}

export enum TrafficLightEnum {
  RED_DOWN = 'RED_DOWN',
  RED_UP = 'RED_UP',
  YELLOW_DOWN = 'YELLOW_DOWN',
  YELLOW_UP = 'YELLOW_UP',
  GREEN = 'GREEN',
  NONE = 'NONE',
}

export enum GestationalAgeUnitEnum {
  WEEKS = 'GESTATIONAL_AGE_UNITS_WEEKS',
  MONTHS = 'GESTATIONAL_AGE_UNITS_MONTHS',
}

// * Order of enums is important
// * Must match order used by the server
export enum RoleEnum {
  VHT = 'VHT',
  HCW = 'HCW',
  ADMIN = 'ADMIN',
  CHO = 'CHO',
}

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
