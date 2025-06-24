import { TrafficLightEnum } from "../enums";
import { OrNull, Referral } from "./types";
import { Assessment } from './assessmentTypes'


export type Reading = {
  appVersion: OrNull<string>;
  diastolicBloodPressure: number;
  systolicBloodPressure: number;
  dateLastSaved: OrNull<number>;
  dateRecheckVitalsNeeded: OrNull<number>;
  dateTaken: OrNull<number>;
  dateUploadedToServer: OrNull<number>;
  deviceInfo: OrNull<string>;
  assessment: OrNull<Assessment>;
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