import {
  AnswerTypeEnum,
  GestationalAgeUnitEnum,
  QRelationEnum,
  QuestionTypeEnum,
  SexEnum,
  TrafficLightEnum,
} from 'src/shared/enums';

import { FacilityField } from 'src/pages/admin/manageFacilities/state';
import { User } from './api/validation/user';

export type Callback<T, U = void> = (args: T) => U;

export type OrNull<T> = T | null;

export type OrUndefined<T> = T | undefined;

export type ServerError = {
  message: string;
  status: number;
};

export type Reading = {
  appVersion: OrNull<string>;
  diastolicBloodPressure: number;
  systolicBloodPressure: number;
  dateLastSaved: OrNull<number>;
  dateRecheckVitalsNeeded: OrNull<number>;
  dateTaken: OrNull<number>;
  dateUploadedToServer: OrNull<number>;
  deviceInfo: OrNull<string>;
  followUp: OrNull<FollowUp>;
  gpsLocationOfReading: OrNull<string>;
  heartRate: number;
  isFlaggedForFollowup: OrNull<boolean>;
  manuallyChangeOcrResults: OrNull<number>;
  patient: string;
  patientId: string;
  readingId: string;
  referral: OrNull<Referral>;
  retestOfPreviousReadingIds: OrNull<string>;
  symptoms?: Array<string>;
  temporaryFlags: OrNull<number>;
  totalOcrSeconds: OrNull<number>;
  trafficLightStatus: TrafficLightEnum;
  userHasSelectedNoSymptoms: boolean;
  urineTest: string;
  urineTests?: UrineTests;
  comment?: string;
  dateReferred?: number;
};

export type UrineTests = {
  leukocytes: string;
  nitrites: string;
  glucose: string;
  protein: string;
  blood: string;
};

export type MedicalRecord = {
  dateCreated: number;
  information: OrNull<string>;
  lastEdited: number;
  medicalRecordId: number;
};

export type Pregnancy = {
  startDate: number;
  endDate: OrNull<number>;
  outcome: OrNull<string>;
  pregnancyId: string;
};

export type TimelineRecord = {
  title: string;
  date: number;
  information?: OrNull<string>;
};

export type Patient = {
  allergy: OrNull<string>;
  dateOfBirth: OrNull<string>;
  drugHistory: OrNull<string>;
  gestationalAgeValue: string;
  pregnancyStartDate: number;
  isPregnant: boolean;
  medicalHistory: OrNull<string>;
  needsAssessment: boolean;
  patientAge: OrNull<number>;
  id: string;
  name: string;
  sex: SexEnum;
  villageNumber: string;
  readings: Array<Reading>;
  tableData: { id: number };
  zone: OrNull<string>;
  isExactDateOfBirth: boolean;
  householdNumber: OrNull<string>;
  isArchived: boolean;
};

export type PatientWithIndex = Patient & {
  index: number;
};

export type PatientMedicalInfo = {
  medicalHistoryId: string;
  medicalHistory: OrNull<string>;
  drugHistoryId: string;
  drugHistory: OrNull<string>;
};

export type PatientPregnancyInfo = {
  isPregnant: boolean;
  pregnancyId: string;
  pregnancyStartDate: number;
  pastPregnancies: PastPregnancy[];
};

export type PastPregnancy = {
  id: string;
  startDate: number;
  endDate: number;
  outcome: string | null;
};

export type SecretKey = {
  smsKey: string;
  staleDate: string;
  expiryDate: string;
  message: string;
};

export type UserWithIndex = User & {
  index: number;
};

export type Form = {
  formTemplateId: number;
  name: string;
  category: string;
  version: string;
  dateCreated: string;
  lastEdited: string;
};

export type Facility = {
  about: string;
  type: string;
  name: string;
  newReferrals: number;
  phoneNumber: string;
  location: string;
  index: number;
};
export type RelayNum = {
  phone: string;
  description: string;
  lastReceived: number;
};

export type UserWithToken = User & {
  accessToken: string;
};

export type VHT = {
  userId: number;
  email: string;
  firstName: string;
  healthFacilityName: string;
};

export type PatientTrafficLightStats = {
  green: number;
  yellowUp: number;
  yellowDown: number;
  redUp: number;
  redDown: number;
};

export type PatientMonthlyStats = [
  Array<number>,
  Array<number>,
  Array<number>,
  Array<number>,
  Array<number>,
  Array<number>,
  Array<number>,
  Array<number>,
  Array<number>,
  Array<number>,
  Array<number>,
  Array<number>
];

export type PatientStatistics = {
  trafficLightCountsFromDay1: PatientTrafficLightStats;
  currentMonth: number;
  bpSystolicReadingsMonthly?: PatientMonthlyStats;
  bpDiastolicReadingsMonthly?: PatientMonthlyStats;
  heartRateReadingsMonthly?: PatientMonthlyStats;
  bpSystolicReadingsLastTwelveMonths?: PatientMonthlyStats;
  bpDiastolicReadingsLastTwelveMonths?: PatientMonthlyStats;
  heartRateReadingsLastTwelveMonths?: PatientMonthlyStats;
};

export type NewAssessment = {
  diagnosis: string;
  treatment: string;
  specialInvestigations: string;
  medicationPrescribed: string;
  followupNeeded: boolean;
  followupInstructions: OrNull<string>;
};
//FollowUp == Assessment
export type FollowUp = NewAssessment & {
  id: number;
  dateAssessed: number;
  healthcareWorkerId: string;
  readingId: string;
  //add Spring 2022
  patientId: string;
};

export type Card = Reading & FollowUp & Referral & CustomizedForm;

export type Referral = {
  id: string;
  actionTaken: OrNull<string>;
  dateReferred: number;
  comment: string;
  healthFacility: string;
  isAssessed: boolean;
  patientId: string;
  readingId: string;
  healthFacilityName: string;
  userId: OrNull<number>;
  dateAssessed: number;
  isCancelled: boolean;
  dateCancelled: number;
  cancelReason: string;
  vitalSign: TrafficLightEnum;
  notAttended: boolean;
  dateNotAttended: number;
  notAttendReason: string;
};

export type ReferralFilter = {
  healthFacilityNames: string[];
  dateRange: string;
  referrers: string[];
  vitalSigns: TrafficLightEnum[];
  isAssessed: string | undefined;
  isPregnant: string | undefined;
};

export type Referrer = {
  email: string;
  firstName: string;
  healthFacilityName: string;
  userId: string;
};

export type HealthFacility = string;

export interface IFormClassification {
  id: string | undefined;
  name: string;
}

export interface FormTemplate {
  classification: IFormClassification;
  dateCreated: number;
  category: string;
  id: string;
  version: string;
  archived: boolean;
}

export interface FormTemplateWithQuestions {
  classification: IFormClassification;
  version: string;
  questions: TQuestion[];
}

export interface CForm {
  dateCreated: number;
  category: string;
  id: string | undefined; //when doing form creating,from ;
  lastEdited: number;
  version: string | undefined; //when doing form creating,from client-end, this 'version' field needs to be omitted
  name: string;
  lang: string;
  questions: Question[];
  patientId: string | undefined; //this is only used in client when we need to do the 'form creating' net post
}

export type QAnswer = {
  qidx: number;
  qtype: QuestionTypeEnum | null;
  anstype: AnswerTypeEnum | null; //value,text,mc,me,comment
  val: any;
};

export interface QCondition {
  qidx: number;
  relation: QRelationEnum;
  answers: Answer;
}

export type Answer = {
  number?: number | undefined;
  text?: string | undefined;
  mcidArray?: number[] | undefined;
  comment?: string | undefined;
};

// Question is used in Form
export type Question = {
  id: string;
  isBlank: boolean;
  questionIndex: number;
  questionText: string;
  questionType: QuestionTypeEnum;
  required: boolean;
  allowFutureDates: boolean;
  allowPastDates: boolean;

  numMin: OrNull<number>;
  numMax: OrNull<number>;
  stringMaxLength?: OrNull<number>;
  stringMaxLines?: OrNull<number>;
  units?: OrNull<string>;

  answers: Answer | undefined;
  visibleCondition: QCondition[];

  formTemplateId: string;
  mcOptions: McOption[]; //only used in form
  hasCommentAttached: boolean;

  shouldHidden?: OrNull<boolean> | undefined;
  dependencies?: OrNull<[]> | undefined;
};

//TQuestion will be only used in template
// with * options will be used in creating template
export interface TQuestion {
  categoryIndex: OrNull<number>;
  questionId: string | undefined;
  questionLangVersions: QuestionLangVersion[];
  questionIndex: number;
  questionType: QuestionTypeEnum;
  required: boolean;
  allowPastDates: boolean;
  allowFutureDates: boolean;
  numMin?: OrNull<number>;
  numMax?: OrNull<number>;
  stringMaxLength?: OrNull<number>;
  stringMaxLines?: OrNull<number>;
  units?: OrNull<string>;
  visibleCondition: QCondition[];
}

export interface QuestionLangVersion {
  lang: string;
  mcOptions: McOption[];
  questionText: string;
}

export type McOption = {
  mcid: number;
  opt: string;
};

export type CustomizedForm = {
  id: number;
  patientId: string;
  formTemplateId: number;
  classification: IFormClassification;
  dateCreated: number;
  lastEdited: number;
  lastEditedBy: number;
  category: string;
  name: string;
};

export type FilterRequestBody = {
  referrals: boolean;
  readings: boolean;
  assessments: boolean;
  forms: boolean;
};

export type FilterRequestKey = keyof FilterRequestBody;

export type Filter = {
  //parameter is for net request;display_title is for UI display
  parameter: FilterRequestKey;
  display_title: string;
};
export type LanguageModalProps = {
  language: string[];
  setLanguage: React.Dispatch<React.SetStateAction<string[]>>;
};
