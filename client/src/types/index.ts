import {
  GestationalAgeUnitEnum,
  PatientStateEnum,
  SexEnum,
  TrafficLightEnum,
  UserRoleEnum,
} from 'src/enums';

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
  urineTests: any;
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

export type Patient = {
  dob: OrNull<string>;
  drugHistory: OrNull<string>;
  gestationalAgeUnit: GestationalAgeUnitEnum;
  gestationalAgeValue: string;
  gestationalTimestamp: number;
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

export type GlobalSearchPatient = {
  patientName: string;
  patientId: string;
  villageNumber: string;
  readings: Array<Reading>;
  state: PatientStateEnum;
};

export interface IUser {
  userId: number;
  email: string;
  firstName: string;
  healthFacilityName: string;
  role: UserRoleEnum;
  supervises: number[];
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

export type TrafficLightStatistics = {
  green: number;
  yellowUp: number;
  yellowDown: number;
  redUp: number;
  redDown: number;
};

export type YearPatientStatistics = [
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
  trafficLightCountsFromDay1: TrafficLightStatistics;
  bpSystolicReadingsMonthly?: YearPatientStatistics;
  bpDiastolicReadingsMonthly?: YearPatientStatistics;
  heartRateReadingsMonthly?: YearPatientStatistics;
};

export type YearGlobalStatistics = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export type Statistics = {
  assessmentsPerMonth: YearGlobalStatistics;
  readingsPerMonth: YearGlobalStatistics;
  referralsPerMonth: YearGlobalStatistics;
  pregnantWomenAssessedPerMonth: YearGlobalStatistics;
  pregnantWomenReferredPerMonth: YearGlobalStatistics;
  trafficLightStatusLastMonth: TrafficLightStatistics;
  uniquePeopleAssesedPerMonth: YearGlobalStatistics;
  womenAssessedPerMonth: YearGlobalStatistics;
  womenReferredPerMonth: YearGlobalStatistics;
};

export type NewAssessment = {
  diagnosis: string;
  treatment: string;
  specialInvestigations: string;
  medicationPrescribed: string;
  followupNeeded: boolean;
  followupInstructions: OrNull<string>;
};

export type FollowUp = NewAssessment & {
  id: number;
  dateAssessed: number;
  healthcareWorkerId: string;
  readingId: string;
};

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
};

export type StatisticsDataset<Label, Data, BackgroundColor = string> = {
  backgroundColor: BackgroundColor;
  data: Data;
  label?: Label;
  fill?: false;
  lineTension?: 0.1;
  borderColor?: string;
  pointRadius?: 1;
};

export type HealthFacility = string;
