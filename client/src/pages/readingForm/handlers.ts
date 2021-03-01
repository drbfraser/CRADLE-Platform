import { apiFetch } from '../../../src/shared/utils/api';
import { EndpointEnum } from '../../server';
import { BASE_URL } from '../../server/utils';
import { ReadingField, ReadingState } from './state';
import { getSymptomsFromFormState } from './symptoms/symptoms';

// not sure why the GUID is being generated client side... this should be moved server side
const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getSubmitObject = (
  patientId: string,
  values: ReadingState,
  userId: number
) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const readingGuid = guid();

  // user ID and healthcare worker ID should be moved to the backend
  const submitValues = {
    userId: userId,
    patientId: patientId,
    readingId: readingGuid,
    dateTimeTaken: currentTimestamp,
    bpDiastolic: values[ReadingField.bpDiastolic],
    bpSystolic: values[ReadingField.bpSystolic],
    heartRateBPM: values[ReadingField.heartRateBPM],
    symptoms: getSymptomsFromFormState(values, true),
    followup: {
      dateAssessed: currentTimestamp,
      diagnosis: values[ReadingField.finalDiagnosis],
      followupInstructions: values[ReadingField.followUpInstruc],
      followupNeeded: values[ReadingField.followUp],
      healthcareWorkerId: userId,
      medicationPrescribed: values[ReadingField.medication],
      readingId: readingGuid,
      specialInvestigations: values[ReadingField.investigation],
      treatment: values[ReadingField.treatment],
    },
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
  userId: number
) => {
  const submitValues = getSubmitObject(patientId, values, userId);
  const url = BASE_URL + EndpointEnum.READINGS;

  try {
    const resp = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(submitValues),
    });

    if (!resp.ok) {
      throw new Error('Response failed with error code: ' + resp.status);
    }
  } catch (e) {
    console.error(e);
    return false;
  }

  return true;
};
