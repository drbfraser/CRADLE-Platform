export enum SexEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum GestationalAgeUnitEnum {
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS',
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

export enum MethodEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum EndpointEnum {
  ASSESSMENTS = '/assessments',
  ASSESSMENT_UPDATE = '/assessmentUpdate',
  HEALTH_FACILITY_LIST = '/facilities?simplified=true',
  HEALTH_FACILITIES = '/facilities',
  PATIENTS = '/patients',
  PATIENT_INFO = '/info' /* /patients/{PATIENT_ID}/info */,
  REFERRALS = '/referrals',
  READINGS = '/readings',
  STATISTICS = '/stats',
  STATS_ALL = '/stats/all',
  STATS_FACILITY = '/stats/facility',
  STATS_USER = '/stats/user',
  STATS_USER_EXPORT = '/stats/export',
  ALL_VHTS = '/user/vhts',
  AUTH = '/user/auth',
  REFRESH = '/user/auth/refresh_token',
  USER = '/user/',
  USER_ALL = '/user/all',
  USER_CURRENT = '/user/current',
  USER_REGISTER = '/user/register',
  CHANGE_PASS = '/user/current/change_pass',
  RESET_PASS = '/change_pass',
}
