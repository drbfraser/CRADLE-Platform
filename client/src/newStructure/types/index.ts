import { SexEnum, TrafficLightEnum } from "../enums"

export type Reading = {
  readingId: string;
  bpSystolic: number;
  bpDiastolic: number;
  heartRateBPM: number;
  symptoms: string;
  trafficLightStatus: TrafficLightEnum;
  dateLastSaved: number;
  dateTimeTaken: number;
  dateUploadedToServer: number;
  dateRecheckVitalsNeeded: number;
  gpsLocationOfReading: string;
  retestOfPreviousReadingIds: string;
  isFlaggedForFollowup: boolean;
  appVersion: string;
  deviceInfo: string;
  totalOcrSeconds: number;
  manuallyChangeOcrResults: number;
  temporaryFlags: number;
  userHasSelectedNoSymptoms: boolean;
  urineTest: string;
  referral: any;
  dateReferred?: number;
};

export type Patient = {
  patientId: string;
  patientName: string;
  patientAge: number;
  patientSex: SexEnum;
  isPregnant: boolean;
  gestationalAgeUnit: string;
  gestationalAgeValue: string;
  medicalHistory: string;
  drugHistory: string;
  zone: string;
  dob: number;
  villageNumber: string;
  readings: Array<Reading>;
};

export type Callback<T, U = void> = (args: T) => U;

export type OrNull<T> = T | null;

export type OrUndefined<T> = T | undefined;