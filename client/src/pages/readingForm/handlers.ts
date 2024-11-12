import { ReadingField, ReadingState } from './state';
import { saveDrugHistoryAsync, saveReadingAsync } from 'src/shared/api/api';

import { getSymptomsFromFormState } from './symptoms/symptoms';

const getSubmitObject = (patientId: string, values: ReadingState) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  // user ID and healthcare worker ID should be moved to the backend
  const submitValues = {
    patientId: patientId,
    dateTaken: currentTimestamp,
    diastolicBloodPressure: values[ReadingField.bpDiastolic],
    systolicBloodPressure: values[ReadingField.bpSystolic],
    heartRateBPM: values[ReadingField.heartRateBPM],
    symptoms: getSymptomsFromFormState(values, true),
  } as any;

  if (values[ReadingField.urineTest]) {
    submitValues['urineTests'] = {
      blood: values[ReadingField.blood],
      glu: values[ReadingField.glucose],
      leuc: values[ReadingField.leukocytes],
      nit: values[ReadingField.nitrites],
      pro: values[ReadingField.protein],
    };
  }

  return submitValues;
};

export const handleSubmit = async (
  patientId: string,
  values: ReadingState,
  drugHistory: string
) => {
  const submitValues = getSubmitObject(patientId, values);

  try {
    await saveReadingAsync(submitValues);

    const newDrugHistory = values[ReadingField.drugHistory];
    if (drugHistory !== newDrugHistory) {
      await saveDrugHistoryAsync(patientId, newDrugHistory);
    }
  } catch (e) {
    console.error(e);
    return false;
  }

  return true;
};
