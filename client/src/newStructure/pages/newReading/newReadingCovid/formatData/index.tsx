/*
*      "patientId": "123456",
       "patientName": "testName",
       "householdNumber": "20",
       "dob": "1990-05-30",
       "zone": "15",
       "villageNumber": "50",
       "gestationalTimestamp": 1587068710,
       "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_WEEKS",
       "patientSex": "FEMALE",
       "drugHistory": "too much tylenol",
       "medicalHistory": "not enough advil"
*
* */
interface Patient {
  patientId: string;
  patientName: string;
  householdNumber: string;
  dob: string;
  zone: string;
  villageNumber: string;
  gestationalTimestamp: number;
  gestationalAgeUnit: string;
  patientSex: string;
  drugHistory: string;
  medicalHistory: string;
}
interface Reading {
  readingId: string;
  patientId: string;
  bpSystolic: number;
  bpDiastolic: number;
  heartRateBPM: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  temperature: number;
  isFlaggedForFollowup: boolean;
  symptoms: string[];
  dateTimeTaken: string;
  userId: number;
}
interface Assessment {
  diagnosis: string;
  medicationPrescribed: string;
  specialInvestigations: string;
  treatment: string;
  readingId: string;
  followupNeeded: string;
  followupInstructions: string;
}

export const formatPatientData = (unformattedPatient: any) => {
  const formattedPatient: Patient = new (class implements Patient {
    dob: string = unformattedPatient.dob as string;
    drugHistory: string = unformattedPatient.drugHistory as string;
    gestationalAgeUnit: string = unformattedPatient.gestationalAgeUnit as string;
    gestationalTimestamp: number = unformattedPatient.gestationalAgeValueTimeStamp as number;
    householdNumber: string = unformattedPatient.household as string;
    medicalHistory: string = unformattedPatient.medicalHistory as string;
    patientId: string = unformattedPatient.patientId as string;
    patientName: string = unformattedPatient.patientInitial as string;
    patientSex: string = unformattedPatient.patientSex as string;
    villageNumber: string = unformattedPatient.villageNumber as string;
    zone: string = unformattedPatient.zone as string;
  })();
  return formattedPatient;
};
const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
const formatSymptoms = (symptoms: any) => {
  const stringValue = [];

  for (const [key, value] of Object.entries(symptoms)) {
    if (value === true) {
      stringValue.push(key);
    }
  }
  return stringValue;
};

export const formatReadingData = (
  patient: any,
  symptoms: any,
  urineTest: any,
  vital: any,
  userId: any
) => {
  const formattedReading: Reading = new (class implements Reading {
    bpDiastolic: number = vital.bpDiastolic as number;
    bpSystolic: number = vital.bpSystolic as number;
    dateTimeTaken: string = Math.floor(Date.now() / 1000).toString();
    heartRateBPM: number = vital.heartRateBPM as number;
    isFlaggedForFollowup: boolean;
    oxygenSaturation: number = vital.oxygenSaturation as number;
    patientId: string = patient.patientId as string;
    readingId: string = guid();
    respiratoryRate: number = vital.respiratoryRate as number;
    symptoms: string[] = formatSymptoms(symptoms);
    temperature: number = vital.temperature as number;
    userId: number = userId;
  })();
  return formattedReading;
};
//{
// 	"diagnosis": "patient is fine",
// 	"medicationPrescribed": "tylenol",
// 	"specialInvestigations": "bcccccccccddeeeff",
// 	"treatment": "b",
// 	"readingId": "asdasd82314278226313803", - required
// 	"followupNeeded": "TRUE", - required if this field is true lol (might be easier to always send it?)
// 	"followupInstructions": "pls help, give lots of tylenol" - required if followupNeeded = true
// }

export const formatAssessmentData = (assessment: any, readingId: any) => {
  const formattedAssessment: Assessment = new (class implements Assessment {
    diagnosis: string = assessment.finalDiagnosis;
    followupInstructions: string = assessment.InstructionFollow;
    followupNeeded: string = assessment.enabled ? 'TRUE' : 'FALSE';
    medicationPrescribed: string = assessment.medPrescribed;
    readingId: string = readingId;
    specialInvestigations: string = assessment.specialInvestigations;
    treatment: string = assessment.treatmentOP;
  })();
  return formattedAssessment;
};
