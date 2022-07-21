import { ReadingField, ReadingState } from './state';
import { saveDrugHistoryAsync, saveReadingAsync } from 'src/shared/api';

import { getSymptomsFromFormState } from './symptoms/symptoms';

// TODO: not sure why the GUID is being generated client side... this should be moved server side
const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getSubmitObject = (patientId: string, values: ReadingState) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const readingGuid = guid();

  // user ID and healthcare worker ID should be moved to the backend
  const submitValues = {
    patientId: patientId,
    readingId: readingGuid,
    dateTimeTaken: currentTimestamp,
    bpDiastolic: values[ReadingField.bpDiastolic],
    bpSystolic: values[ReadingField.bpSystolic],
    heartRateBPM: values[ReadingField.heartRateBPM],
    symptoms: getSymptomsFromFormState(values, true),
  } as any;

  if (values[ReadingField.urineTest]) {
    submitValues['urineTests'] = {
      urineTestBlood: values[ReadingField.blood],
      urineTestGlu: values[ReadingField.glucose],
      urineTestLeuc: values[ReadingField.leukocytes],
      urineTestNit: values[ReadingField.nitrites],
      urineTestPro: values[ReadingField.protein],
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
    drugHistory !== newDrugHistory &&
      (await saveDrugHistoryAsync(patientId, newDrugHistory));
  } catch (e) {
    console.error(e);
    return false;
  }

  return true;
};
