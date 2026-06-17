import { User } from '../api/validation/user';
import { CustomizedForm } from './form/formTemplateTypes';
import { Reading } from './readingTypes';
import { Assessment } from './assessmentTypes';
import { Referral } from './referralTypes';
import { TrafficLightEnum } from '../enums';

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

export type Card = Reading & Assessment & Referral & CustomizedForm;

export type HealthFacility = {
  name: string;
  type: string;
  phoneNumber: string;
  about: string;
  location: string;
};

export type LanguageModalProps = {
  language: string[];
  setLanguage: React.Dispatch<React.SetStateAction<string[]>>;
};

export type ReadingRecord = {
  id: string;
  systolicBloodPressure?: number;
  diastolicBloodPressure?: number;
  heartRate?: number;
  symptoms?: string[];
  trafficLightStatus: TrafficLightEnum;
  dateTaken: number;
  dateRetestNeeded?: number;
  isFlaggedForFollowUp?: boolean;
  patientId: string;
  userId?: number;
  referralId?: string;
  lastEdited: number;
};

export type ReferralRecord = {
  id: string;
  dateReferred: number;
  comment?: string;
  actionTaken?: string;
  isAssessed: boolean;
  dateAssessed?: number;
  isCancelled: boolean;
  cancelReason?: string;
  dateCancelled?: number;
  notAttended: boolean;
  notAttendReason?: string;
  dateNotAttended?: number;
  patientId: string;
  userId?: number;
  healthFacilityName?: string;
  lastEdited: number;
};

export type AssessmentRecord = {
  id: string;
  followUpInstructions?: string;
  followUpNeeded?: boolean;
  specialInvestigations?: string;
  diagnosis?: string;
  treatment?: string;
  medicationPrescribed?: string;
  dateAssessed: number;
  patientId: string;
  healthcareWorkerId: number;
};

export type FormSubmissionRecord = {
  id: string;
  formTemplateId: string;
  patientId: string;
  userId?: number;
  dateSubmitted: number;
  lastEdited: number;
  lang: string;
  name: string;
};

export type OrganizedRecords = {
  readings: ReadingRecord[];
  referrals: ReferralRecord[];
  assessments: AssessmentRecord[];
  forms: FormSubmissionRecord[];
};

export type FlattenedRecord =
  | (ReadingRecord & { type: 'reading' })
  | (ReferralRecord & { type: 'referral' })
  | (AssessmentRecord & { type: 'assessment' })
  | (FormSubmissionRecord & { type: 'form' });
