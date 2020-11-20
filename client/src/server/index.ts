export enum EndpointEnum {
  ALL = '/all',
  ASSESSMENTS = '/assessments',
  AUTH = '/auth',
  CURRENT = '/current',
  DELETE = '/delete',
  EDIT = '/edit',
  FOLLOW_UP = '/follow_up',
  HEALTH_FACILITY_LIST = '/facilities?simplified=true',
  PATIENTS = '/patients',
  PATIENT_FACILITY = '/patient/facility',
  PATIENT_INFO = '/info' /* /patients/{PATIENT_ID}/info */,
  REFERRALS = '/referrals',
  READINGS = '/readings',
  REFRESH = '/refresh_token',
  STATISTICS = '/stats',
  REGISTER = '/register',
  USER = '/user',
  VHTS = '/vhts',
}

export enum MethodEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
