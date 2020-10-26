import {
  GestationalAgeUnitEnum,
  PatientStateEnum,
  RoleEnum,
  SexEnum,
  TrafficLightEnum,
} from '../enums';

import { AutocompleteOption } from '../shared/components/input/autocomplete/utils';

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

export type NewReading = {
  bpSystolic: string;
  bpDiastolic: string;
  heartRateBPM: string;
  urineTests: Record<keyof UrineTests, string>;
} & Pick<Reading, 'isFlaggedForFollowup'>;

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
  isExactDob:boolean;
};

export type EditedPatient = Pick<
  Patient,
  | 'dob'
  | 'drugHistory'
  | 'gestationalAgeUnit'
  | 'gestationalTimestamp'
  | 'isPregnant'
  | 'medicalHistory'
  | 'patientAge'
  | 'patientId'
  | 'patientName'
  | 'patientSex'
  | 'villageNumber'
  | 'zone'
>;

export type GlobalSearchPatient = {
  patientName: string;
  patientId: string;
  villageNumber: string;
  readings: Array<Reading>;
  state: PatientStateEnum;
};

export type User = {
  associations: unknown;
  email: string;
  firstName: string;
  followups: unknown;
  healthFacility: string;
  healthFacilityName: string;
  id: number;
  referrals: unknown;
  roleIds: Array<number>;
  tableData: {
    id: number;
  };
  username: OrNull<string>;
  vhtList: Array<VHT>;
};

export type ActualUser = Pick<
  User,
  'email' | 'firstName' | 'healthFacilityName' | 'vhtList'
> & {
  isLoggedIn: boolean;
  refresh: string;
  roles: Array<RoleEnum>;
  token: string;
  userId: number;
};

export type EditUser = Omit<
  User,
  'healthFacilityName' | 'roleIds' | 'vhtList'
> & {
  healthFacilityName: AutocompleteOption<string, string>;
  roleIds: Array<AutocompleteOption<RoleEnum, number>>;
  vhtList: Array<AutocompleteOption<string, number>>;
};

export type VHT = {
  id: number;
  email: string;
};

export type CheckedItems = {
  none: boolean;
  headache: boolean;
  bleeding: boolean;
  blurredVision: boolean;
  feverish: boolean;
  abdominalPain: boolean;
  unwell: boolean;
  other: boolean;
  otherSymptoms: string;
};

export type SelectedUser = {
  email: string;
  firstName: string;
  healthFacilityName: string;
  dropdownSelections: any[];
  vhtDropdownSelections: any[];
  roleIds: Array<string>;
};

export type PatientNewReading = {
  dob: OrNull<string>;
  drugHistory: OrNull<string>;
  gestationalAgeUnit: string;
  gestationalAgeValue: string;
  gestationalTimestamp: OrNull<number>;
  isPregnant: boolean;
  medicalHistory: OrNull<string>;
  patientAge: OrNull<string>;
  patientId: string;
  patientName: string;
  patientSex: string;
  villageNumber: string;
  zone: OrNull<string>;
  isExactDob:boolean;
};

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
