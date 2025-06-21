export enum FormRenderStateEnum {
  EDIT = 'EDIT',
  VIEW = 'VIEW',
  FIRST_SUBMIT = 'FIRST_SUBMIT',
  SUBMIT_TEMPLATE = 'SUBMIT_TEMPLATE',
  VIS_COND = 'VIS_COND',
  VIS_COND_DISABLED = 'VIS_COND_DISABLED',
}

export enum SexEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum GestationalAgeUnitEnum {
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS',
}

export enum StatsOptionEnum {
  THIS_YEAR = 'THIS_YEAR',
  LAST_TWELVE_MONTHS = 'LAST_TWELVE_MONTHS',
}

export enum TrafficLightEnum {
  GREEN = 'GREEN',
  YELLOW_UP = 'YELLOW_UP',
  YELLOW_DOWN = 'YELLOW_DOWN',
  RED_UP = 'RED_UP',
  RED_DOWN = 'RED_DOWN',
  //original 'UNAVAILABLE' now changed to 'NONE',
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
  HEALTH_FACILITIES = '/facilities',
  MEDICAL_HISTORY = '/medical_history' /* /patients/{PATIENT_ID}/medicalHistory */,
  MEDICAL_INFO = '/medical_info',
  MEDICAL_RECORDS = '/medical_records',
  PATIENTS = '/patients',
  PATIENT_INFO = '/info' /* /patients/{PATIENT_ID}/info */,
  PATIENT_TIMELINE = '/timeline' /* /patients/{PATIENT_ID}/timeline */,
  PREGNANCIES = '/pregnancies',
  PREGNANCY_RECORDS = '/pregnancies' /* /patients/{PATIENT_ID}/pregnancies */,
  PREGNANCY_STATUS = '/pregnancies/status',
  PREGNANCY_SUMMARY = '/pregnancy_summary',
  REFERRALS = '/referrals',
  REFERRALS_ASSESS = '/referrals/assess',
  FORM_TEMPLATES = '/forms/templates',
  FORM_CLASSIFICATIONS = '/forms/classifications',
  READINGS = '/readings',
  READING_ASSESSMENT = '/patients/reading-assessment', //Create a new reading and assessment
  RELAY_SERVER_PHONE = '/relay/server/phone',
  STATISTICS = '/stats',
  STATS_ALL = '/stats/all',
  STATS_FACILITY = '/stats/facility',
  STATS_USER = '/stats/user',
  STATS_USER_EXPORT = '/stats/export',
  ALL_VHTS = '/user/vhts',
  AUTH = '/user/auth',
  REFRESH = '/user/auth/refresh_token',
  UPLOAD_ADMIN = '/upload/admin',
  USER = '/user/',
  USER_ALL = '/user/all',
  USER_CURRENT = '/user/current',
  USER_REGISTER = '/user/register',
  USER_VHTS = '/user/vhts',
  CHANGE_PASS = '/user/current/change_pass',
  RESET_PASS = '/change_pass',
  FORM = '/forms/responses',
  SECRETKEY = '/smskey' /* /user/{USER_ID}/smsKey */,
  //workflow instance
  WORKFLOW_INSTANCES = '/workflow/instances',
  //workflow templates
  WORKFLOW_TEMPLATES = '/workflow/templates',
  WORKFLOW_CLASSIFICATIONS = '/workflow/classifications',
}

export enum QRelationEnum {
  LARGER_THAN = 'LARGER_THAN',
  SMALLER_THAN = 'SMALLER_THAN',
  EQUAL_TO = 'EQUAL_TO',
  CONTAINS = 'CONTAINS',
}

export enum QuestionTypeEnum {
  INTEGER = 'INTEGER',
  STRING = 'STRING',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  CATEGORY = 'CATEGORY',
}

export enum AnswerTypeEnum {
  NUM = 'number',
  TEXT = 'text',
  MC_ID_ARRAY = 'mcIdArray',
  COMMENT = 'comment',
  CATEGORY = '',
}

export enum SecretKeyMessage {
  NORMAL = 'NORMAL',
  EXPIRED = 'EXPIRED',
  WARN = 'WARN',
  NOTFOUND = 'NOTFOUND',
}

//WORKFLOW_INSTANCES STATUS
export enum WorkflowInstanceStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
