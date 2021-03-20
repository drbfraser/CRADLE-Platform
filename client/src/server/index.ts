export enum EndpointEnum {
  ALL = '/all',
  ASSESSMENTS = '/assessments',
  ASSESSMENT_UPDATE = '/assessmentUpdate',
  AUTH = '/auth',
  CURRENT = '/current',
  CHANGE_PASS = '/user/change_pass',
  RESET_PASS = '/admin/change_pass',
  DELETE_USER = '/user/delete/',
  DELETE = '/delete',
  EDIT = '/edit',
  HEALTH_FACILITY_LIST = '/facilities?simplified=true',
  HEALTH_FACILITIES = '/facilities',
  PATIENTS = '/patients',
  PATIENT_INFO = '/info' /* /patients/{PATIENT_ID}/info */,
  PATIENT_ASSOCIATIONS = '/patientAssociations',
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
