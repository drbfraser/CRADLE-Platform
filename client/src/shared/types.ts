import {
  GestationalAgeUnitEnum,
  SexEnum,
  TrafficLightEnum,
  UserRoleEnum,
  // QuestionTypeEnum,
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

export interface IForm {
  formTemplateId: number;
  name: string;
  category: string;
  version: string;
  dateCreated: string;
  lastEdited: string;
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

//updated
// export type QCondition = {
//   qidx: number;
//   relation: string; //better to update to QRelationEnum;
//   answer: Answer;
// };




  // mc: OrNull<string | undefined>[];//修改了名字
// export type Answer = {
//   number: OrNull<number> | undefined;
//   text: OrNull<string> | undefined;
//   mcidArray: OrNull<number[]> | undefined;
//   comment: OrNull<string> | undefined;
// };




export interface FormTemplate {
  category:  string;
  id:        string;
  name:      string;
  questions: TQuestion[];
  version:   string;
}
//http://localhost:5000/api/forms/templates  (get a list of forms)
export interface FormSchema {
  dateCreated: number;
  category:    string;
  id:          string;
  lastEdited:  number;
  version:     string;
  name:        string;
}
export interface Form {
  dateCreated: number;
  category:    string;
  id:          string;
  lastEdited:  number;
  version:     string;
  name:        string;
  lang:        string;
  questions:   Question[];
}


export type QAnswer = {
  qidx: number ;
  qtype: string | null; 
  anstype: string | null;//value,text,mc,me,comment
  val: any;

};
export interface QCondition {
  qidx: number;
  relation: string; //* better to update to QRelationEnum [EQUAL_TO];
  answers: Answer;//*
};
export type Answer = {
  number?: number | undefined;
  text?: string | undefined;
  mcidArray?: number[] | undefined;   
  comment?: string | undefined;

  //自用
  // mcValArray?: number[] | undefined;
};






// Question is used in Form
export interface Question {
  ///////////// recently added 04.14
  // categoryId: OrNull<string> | undefined;//*
  // questionId: string | undefined;//*
  // questionLangVersions: OrNull<QuestionLangVersion[]> | undefined;//*
  /////////////
  id: string;//*
  isBlank: boolean;
  questionIndex: number;//*
  questionText: string;
  questionType: string;//*
  // category: string;
  required: boolean;//*

  // mcOptions?: OrNull<string>[];
  numMin?: OrNull<number>;//*
  numMax?: OrNull<number>;//*
  stringMaxLength?: OrNull<number>;//*
  units?: OrNull<string>;//*

  answers: Answer | undefined;
  visibleCondition?: OrNull<QCondition[]> | undefined;//*


  /////////// only in form
  formTemplateId: string;
  mcOptions?: McOption[]; //only used in form
  hasCommentAttached: boolean;
  ////////////
  shouldHidden?: OrNull<boolean> | undefined;
  dependencies?: OrNull<[]> | undefined;
};


//TQuestion will be only used in template 
// with * options will be used in creating template
export interface TQuestion {
  ///////////// recently added 04.14
  categoryId: OrNull<number> | undefined;//*
  questionId: string | undefined;//*
  questionLangVersions: OrNull<QuestionLangVersion[]> | undefined;//*

  /////////////
  id: string;//*
  isBlank: boolean;
  questionIndex: number;//*
  // questionText: string;
  questionType: string;//*
  // category: string;
  required: boolean;//*

  // mcOptions?: OrNull<string>[];
  numMin?: OrNull<number>;//*
  numMax?: OrNull<number>;//*
  stringMaxLength?: OrNull<number>;//*
  units?: OrNull<string>;//*

  // answers?: OrNull<Answer> | undefined;
  visibleCondition?: QCondition[] | undefined;//*

  /////////// only in form
  // formTemplateId: string;
  // mcOptions?: OrNull<McOption> | undefined; //only used in form
  // hasCommentAttached: boolean;
  ////////////

  // shouldHidden?: OrNull<boolean> | undefined;
  // dependencies?: OrNull<[]> | undefined;
};

export interface QuestionLangVersion {
  lang:         string;
  mcOptions?:    OrNull<McOption[]> | undefined;
  questionText: string;
}

export interface McOption {
  mcid: number;
  opt:  string;
}

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



// export enum QuestionTypeEnum{
//   INTEGER = 'INTEGER',
//   // DECIMAL = "DECIMAL",
//   STRING = 'STRING',
//   MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
//   MULTIPLE_SELECT = 'MULTIPLE_SELECT',
//   DATE = 'DATE',
//   // TIME = "TIME",
//   // DATETIME = "DATETIME",
//   // CATEGORY = "CATEGORY",
// }
