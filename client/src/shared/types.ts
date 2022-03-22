import {
  GestationalAgeUnitEnum,
  SexEnum,
  TrafficLightEnum,
  UserRoleEnum,
  // QRelationEnum,
} from 'src/shared/enums';
// import { number, string } from 'yup';

export type Callback<T, U = void> = (args: T) => U;

export type OrNull<T> = T | null;

export type OrUndefined<T> = T | undefined;

export type ServerError = {
  message: string;
  status: number;
};

export type Reading = {
  appVersion: OrNull<string>;
  bpDiastolic: number;
  bpSystolic: number;
  dateLastSaved: OrNull<number>;
  dateRecheckVitalsNeeded: OrNull<number>;
  dateTimeTaken: OrNull<number>;
  dateUploadedToServer: OrNull<number>;
  deviceInfo: OrNull<string>;
  followup: OrNull<FollowUp>;
  gpsLocationOfReading: OrNull<string>;
  heartRateBPM: number;
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
  urineTestNit: string;
  urineTestBlood: string;
  urineTestLeuc: string;
  urineTestPro: string;
  urineTestGlu: string;
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
  dob: OrNull<string>;
  drugHistory: OrNull<string>;
  gestationalAgeUnit: GestationalAgeUnitEnum;
  gestationalAgeValue: string;
  pregnancyStartDate: number;
  isPregnant: boolean;
  medicalHistory: OrNull<string>;
  needsAssessment: boolean;
  patientAge: OrNull<number>;
  patientId: string;
  patientName: string;
  patientSex: SexEnum;
  villageNumber: string;
  readings: Array<Reading>;
  tableData: { id: number };
  zone: OrNull<string>;
  isExactDob: boolean;
  householdNumber: OrNull<string>;
};

export type PatientMedicalInfo = {
  medicalHistoryId: string;
  medicalHistory: OrNull<string>;
  drugHistoryId: string;
  drugHistory: OrNull<string>;
};

export type PatientPregnancyInfo = {
  gestationalAgeUnit: GestationalAgeUnitEnum;
  isPregnant: boolean;
  pregnancyId: string;
  pregnancyStartDate: number;
  pastPregnancies: PastPregnancy[];
};

export type PastPregnancy = {
  pregnancyId: string;
  pregnancyEndDate: number;
  pregnancyOutcome: OrNull<string>;
  pregnancyStartDate: number;
};

export interface IUser {
  userId: number;
  email: string;
  firstName: string;
  healthFacilityName: string;
  role: UserRoleEnum;
  supervises: number[];
  index: number;
}

export interface IUserWithIndex extends IUser {
  index: number;
}

export interface IFacility {
  about: string;
  facilityType: string;
  healthFacilityName: string;
  healthFacilityPhoneNumber: string;
  location: string;
}

export interface IUserWithTokens extends IUser {
  token: string;
  refresh: string;
}

export interface IVHT {
  userId: number;
  email: string;
  firstName: string;
  healthFacilityName: string;
}

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

//2022 Spring add
export type Card = Reading & FollowUp & Referral;

export type Referral = {
  id: string;
  actionTaken: OrNull<string>;
  dateReferred: number;
  comment: string;
  healthFacility: string;
  isAssessed: boolean;
  patientId: string;
  readingId: string;
  referralHealthFacilityName: string;
  userId: OrNull<number>;
  // add(Spring 2022)
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

///////////////////////////////////////////
export type customizedForm = {
  name: string;
  type: string;
};

export type QCondition = {
  qidx: number;
  relation: string; //better to update to QRelationEnum;
  answer: Answer;
};

export type QAnswer = {
  qidx: number | null;
  key: string | null; //value,text,mc,comment
  value: any;
};

export type Answer = {
  value: OrNull<number>;
  text: OrNull<string>;
  mc: OrNull<string | undefined>[];
  comment: OrNull<string>;
};
export type Question = {
  id: number;
  isBlank: boolean;
  questionIndex: number;
  questionText: string;
  questionType: string;
  category: string;
  required: boolean;

  mcOptions?: OrNull<string>[];
  numMin?: OrNull<number>;
  numMax?: OrNull<number>;
  stringMaxLength?: OrNull<number>;
  units?: OrNull<string>;
  answers?: OrNull<Answer>;
  visibleCondition?: QCondition[] | undefined;
  shouldHidden?: OrNull<boolean> | undefined;
  dependencies?: OrNull<[]> | undefined;
};

export type CustomizedForm = {
  id: number;
  patientId: string;
  formTemplateId: number;
  dateCreated: number;
  lastEdited: number;
  lastEditedBy: number;
  category: string;
  name: string;
};
