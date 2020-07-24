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
