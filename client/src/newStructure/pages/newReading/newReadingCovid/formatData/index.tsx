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
  isPregnant: boolean;
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
  followup: {
    diagnosis: string;
    medicationPrescribed: string;
    specialInvestigations: string;
    treatment: string;
    readingId: string;
    dateAssessed: string;
    healthcareWorkerId: 1;
  };
}
interface ReadingVHT {
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

const getSymptomsMapping = (symptoms: any) => {
  switch (symptoms) {
    case 'none':
      return 'NONE';
    case 'headache':
      return 'HEADACHE';
    case 'bleeding':
      return 'BLEEDING';
    case 'blurredVision':
      return 'BLURRED VISION';
    case 'feverish':
      return 'FEVERISH';
    case 'abdominalPain':
      return 'ABDOMINAL PAIN';
    case 'unwell':
      return 'UNWELL';
    case 'cough':
      return 'COUGH';
    case 'shortnessBreath':
      return 'SHORTNESS of BREATH';
    case 'soreThroat':
      return 'SORE THROAT';
    case 'muscleAche':
      return 'MUSCLE ACHE';
    case 'fatigue':
      return 'FATIGUE';
    case 'lossOfSense':
      return 'LOSS of SENSE';
    case 'lossOfTaste':
      return 'LOSS of TASTE';
    case 'lossOfSmell':
      return 'LOSS of SMELL';
    default:
      return '';
  }
};

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
    isPregnant: boolean = unformattedPatient.isPregnant as boolean;
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
      const pushValue = getSymptomsMapping(key);
      stringValue.push(pushValue);
    }
  }
  if (symptoms.otherSymptoms !== '') {
    stringValue.push(symptoms.otherSymptoms);
  }
  return stringValue;
};

export const formatReadingData = (
  patientId: any,
  symptoms: any,
  urineTest: any,
  vital: any,
  assessment: any,
  userId: any
) => {
  const readingidGenerated = guid();
  const formattedReading: Reading = new (class implements Reading {
    bpDiastolic: number = vital.bpDiastolic as number;
    bpSystolic: number = vital.bpSystolic as number;
    dateTimeTaken: string = Math.floor(Date.now() / 1000).toString();
    heartRateBPM: number = vital.heartRateBPM as number;
    isFlaggedForFollowup: boolean;
    oxygenSaturation: number = vital.oxygenSaturation as number;
    patientId: string = patientId as string;
    readingId: string = readingidGenerated;
    respiratoryRate: number = vital.respiratoryRate as number;
    symptoms: string[] = formatSymptoms(symptoms);
    temperature: number = vital.temperature as number;
    userId: number = userId;
    followup = {
      diagnosis: assessment.finalDiagnosis,
      followupInstructions: assessment.InstructionFollow,
      followupNeeded: assessment.enabled ? true : false,
      medicationPrescribed: assessment.medPrescribed,
      readingId: readingidGenerated,
      specialInvestigations: assessment.specialInvestigations,
      treatment: assessment.treatmentOP,
      dateAssessed: Math.floor(Date.now() / 1000).toString(),
      healthcareWorkerId: userId,
    };
  })();
  return formattedReading;
};

export const formatReadingDataVHT = (
  patientId: any,
  symptoms: any,
  urineTest: any,
  vital: any,
  userId: any
) => {
  const readingidGenerated = guid();
  const formattedReading: ReadingVHT = new (class implements ReadingVHT {
    bpDiastolic: number = vital.bpDiastolic as number;
    bpSystolic: number = vital.bpSystolic as number;
    dateTimeTaken: string = Math.floor(Date.now() / 1000).toString();
    heartRateBPM: number = vital.heartRateBPM as number;
    isFlaggedForFollowup: boolean;
    oxygenSaturation: number = vital.oxygenSaturation as number;
    patientId: string = patientId as string;
    readingId: string = readingidGenerated;
    respiratoryRate: number = vital.respiratoryRate as number;
    symptoms: string[] = formatSymptoms(symptoms);
    temperature: number = vital.temperature as number;
    userId: number = userId;
  })();
  return formattedReading;
};
