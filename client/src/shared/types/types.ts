import { User } from '../api/validation/user';
import { CustomizedForm } from './form/formTemplateTypes';
import { Reading } from './readingTypes';
import { Assessment } from './assessmentTypes';
import { Referral } from './referralTypes';

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
