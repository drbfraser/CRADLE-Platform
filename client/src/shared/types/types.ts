import {
  SexEnum,
  TrafficLightEnum,
} from 'src/shared/enums';

import { User } from '../api/validation/user';

import { CustomizedForm } from './form/formTypes';
import { Reading } from './readingTypes';

export type Callback<T, U = void> = (args: T) => U;

export type OrNull<T> = T | null;

export type OrUndefined<T> = T | undefined;

export type ServerError = {
  message: string;
  status: number;
};

export type MedicalRecord = {
  dateCreated: number;
  information: OrNull<string>;
  lastEdited: number;
  id: number;
};

export type Pregnancy = {
  startDate: number;
  endDate: OrNull<number>;
  outcome: OrNull<string>;
  id: number;
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
  key: string;
  staleDate: string;
  expiryDate: string;
  message: string;
};

export type UserWithIndex = User & {
  index: number;
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
  phoneNumber: string;
  description: string;
  lastReceived: number;
};

export type UserWithToken = User & {
  accessToken: string;
};

export type VHT = {
  userId: number;
  email: string;
  name: string;
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
  followUpNeeded: boolean;
  followUpInstructions: OrNull<string>;
  healthcareWorkerId: number | undefined;
};

export type Assessment = NewAssessment & {
  id: number;
  dateAssessed: number;
  healthcareWorkerId: string;
  readingId: string;
  //add Spring 2022
  patientId: string;
};

export type Card = Reading & Assessment & Referral & CustomizedForm;

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
  isAssessed?: string;
  isPregnant?: string;
};

export type Referrer = {
  email: string;
  firstName: string;
  healthFacilityName: string;
  userId: string;
};

export type HealthFacility = {
  name: string;
  type: string;
  phoneNumber: string;
  about: string;
  location: string;
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
