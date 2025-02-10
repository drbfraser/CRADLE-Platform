import { API_URL, axiosFetch } from 'src/shared/api/api';
import {
  EndpointEnum,
  GestationalAgeUnitEnum,
  SexEnum,
} from 'src/shared/enums';
import { initialState, PatientField, PatientState } from './state';
import { getDOBForEstimatedAge } from 'src/shared/utils';
import {
  gestationalAgeUnitTimestamp,
  gestationalAgeUnitTimestampWithEndDate,
} from 'src/shared/constants';
import { NavigateFunction } from 'react-router-dom';
import { AxiosError } from 'axios';

export const handleChangeCustom = (handleChange: any, setFieldValue: any) => {
  const resetGestational = () => {
    [
      PatientField.gestationalAgeDays,
      PatientField.gestationalAgeWeeks,
      PatientField.gestationalAgeMonths,
      PatientField.gestationalAgeUnit,
    ].forEach((field) => {
      setFieldValue(field, initialState[field], false);
    });
  };

  return (e: React.ChangeEvent<any>) => {
    handleChange(e);

    if (
      e.target.name === PatientField.patientSex &&
      e.target.value === SexEnum.MALE
    ) {
      setFieldValue(PatientField.isPregnant, false, false);
      resetGestational();
    } else if (e.target.name === PatientField.isPregnant && !e.target.checked) {
      resetGestational();
    }
  };
};

export const handleSubmit = async (
  values: PatientState,
  creatingNew: boolean,
  navigate: NavigateFunction,
  setSubmitError: React.Dispatch<React.SetStateAction<any>>,
  setSubmitting: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage: (message: string) => void
) => {
  setSubmitting(true);

  const patientData = {
    id: values[PatientField.patientId],
    name: values[PatientField.patientName],
    householdNumber: values[PatientField.householdNumber],
    isExactDateOfBirth: Boolean(values[PatientField.isExactDateOfBirth]),
    dateOfBirth: values[PatientField.dateOfBirth],
    zone: values[PatientField.zone],
    villageNumber: values[PatientField.villageNumber],
    sex: values[PatientField.patientSex],
    drugHistory: values[PatientField.drugHistory],
    medicalHistory: values[PatientField.medicalHistory],
    allergy: values[PatientField.allergy],
  };

  /* Separate the pregnancy data from the patient data so that we can
  create the pregnancy record in a separate request to the server. */
  const pregnancyData = {
    isPregnant: Boolean(values[PatientField.isPregnant]),
    startDate: 0,
  };

  if (!patientData.isExactDateOfBirth) {
    patientData.dateOfBirth = getDOBForEstimatedAge(
      parseInt(values[PatientField.estimatedAge])
    );
  }

  if (pregnancyData.isPregnant) {
    pregnancyData.startDate =
      values.gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
        ? gestationalAgeUnitTimestamp[GestationalAgeUnitEnum.WEEKS](
            values.gestationalAgeWeeks,
            values.gestationalAgeDays
          )
        : gestationalAgeUnitTimestamp[GestationalAgeUnitEnum.MONTHS](
            values.gestationalAgeMonths
          );

    pregnancyData.startDate = Math.round(pregnancyData.startDate);
  }

  let method = 'POST';
  let url = API_URL + EndpointEnum.PATIENTS;

  if (!creatingNew) {
    method = 'PUT';
    url += '/' + values[PatientField.patientId] + EndpointEnum.PATIENT_INFO;
  }

  let patientId = '';
  try {
    // Submit Patient data.
    const response = await axiosFetch(url, {
      method: method,
      data: patientData,
    });
    const { id } = response.data;
    patientId = id;
  } catch (e) {
    setSubmitError(true);
    setSubmitting(false);
    if (!(e instanceof AxiosError)) {
      console.error(e);
      throw e;
    }
    const responseBody = e.response?.data;
    if (responseBody && 'message' in responseBody) {
      console.error('Creating patient failed.');
      console.error(responseBody.message);
      setErrorMessage(responseBody.message);
      return;
    }
  }

  const patientPageUrl = `/patients/${patientId}`;
  // If no pregnancy data to submit, navigate to the patient summary page.
  if (!pregnancyData.isPregnant) {
    navigate(patientPageUrl);
    return;
  }

  try {
    url = API_URL + EndpointEnum.PATIENTS + `/${patientId}/pregnancies`;
    method = 'POST';
    await axiosFetch(url, {
      method: method,
      data: {
        startDate: pregnancyData.startDate,
      },
    });
  } catch (e) {
    setSubmitError(true);
    setSubmitting(false);
    if (!(e instanceof AxiosError)) {
      console.error(e);
      throw e;
    }
    const responseBody = e.response?.data;
    if (responseBody && 'message' in responseBody) {
      console.error('Creating pregnancy failed.');
      console.error(responseBody.message);
      setErrorMessage(responseBody.message);
    }
  }

  navigate(patientPageUrl);
};

export const handlePregnancyInfo = async (
  patientId: string | undefined,
  pregnancyId: string | undefined,
  creatingNewPregnancy: boolean,
  values: PatientState,
  navigate: NavigateFunction,
  setSubmitError: React.Dispatch<React.SetStateAction<any>>,
  setSubmitting: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) => {
  setSubmitting(true);

  const submitValues = {
    gestationalAgeUnit: values[PatientField.gestationalAgeUnit],
    pregnancyStartDate: 0,
    pregnancyEndDate: values[PatientField.pregnancyEndDate] || undefined,
    pregnancyOutcome: values[PatientField.pregnancyOutcome],
  };

  if (values[PatientField.pregnancyEndDate]) {
    submitValues.pregnancyEndDate = (
      Date.parse(values[PatientField.pregnancyEndDate]) / 1000
    ).toString();
  } else {
    submitValues.pregnancyEndDate = undefined;
  }

  if (submitValues.pregnancyEndDate) {
    submitValues.pregnancyStartDate =
      submitValues.gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
        ? gestationalAgeUnitTimestampWithEndDate[GestationalAgeUnitEnum.WEEKS](
            values.gestationalAgeWeeks,
            values.gestationalAgeDays,
            submitValues.pregnancyEndDate
          )
        : gestationalAgeUnitTimestampWithEndDate[GestationalAgeUnitEnum.MONTHS](
            values.gestationalAgeMonths,
            submitValues.pregnancyEndDate
          );
  } else {
    submitValues.pregnancyStartDate =
      submitValues.gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
        ? gestationalAgeUnitTimestamp[GestationalAgeUnitEnum.WEEKS](
            values.gestationalAgeWeeks,
            values.gestationalAgeDays
          )
        : gestationalAgeUnitTimestamp[GestationalAgeUnitEnum.MONTHS](
            values.gestationalAgeMonths
          );
  }

  let method = 'POST';
  let url =
    API_URL +
    EndpointEnum.PATIENTS +
    '/' +
    patientId +
    EndpointEnum.PREGNANCIES;
  if (!creatingNewPregnancy) {
    method = 'PUT';
    url = API_URL + EndpointEnum.PREGNANCIES + '/' + pregnancyId;
  }

  await handleApiFetch(
    url,
    method,
    submitValues,
    false,
    navigate,
    setSubmitError,
    setSubmitting,
    setErrorMessage
  );
};

export const handleMedicalRecordInfo = async (
  patientId: string | undefined,
  values: PatientState,
  isDrugRecord: boolean | undefined,
  navigate: NavigateFunction,
  setSubmitError: React.Dispatch<React.SetStateAction<any>>,
  setSubmitting: React.Dispatch<React.SetStateAction<any>>
) => {
  setSubmitting(true);
  const submitValues = isDrugRecord
    ? {
        drugHistory: values[PatientField.drugHistory],
      }
    : {
        patientId,
        isDrugRecord,
        information: values[PatientField.medicalHistory],
      };

  const url =
    API_URL +
    EndpointEnum.PATIENTS +
    '/' +
    patientId +
    EndpointEnum.MEDICAL_RECORDS;

  await handleApiFetch(
    url,
    'POST',
    submitValues,
    false,
    navigate,
    setSubmitError,
    setSubmitting
  );
};

export const handleDeleteRecord = async (
  editId: string,
  universalRecordId: string,
  navigate: NavigateFunction,
  setSubmitError: React.Dispatch<React.SetStateAction<any>>,
  setSubmitting: React.Dispatch<React.SetStateAction<any>>
) => {
  setSubmitting(true);

  const endpoint =
    editId === 'pregnancyInfo'
      ? EndpointEnum.PREGNANCIES
      : EndpointEnum.MEDICAL_RECORDS;
  const url = `${API_URL}${endpoint}/${universalRecordId}`;

  await handleApiFetch(
    url,
    'DELETE',
    undefined,
    false,
    navigate,
    setSubmitError,
    setSubmitting
  );
};

const handleApiFetch = async (
  url: string,
  method: string,
  submitValues: any,
  creatingNew: boolean,
  navigate: NavigateFunction,
  setSubmitError: React.Dispatch<React.SetStateAction<any>>,
  setSubmitting: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage?: React.Dispatch<React.SetStateAction<string>>
) => {
  axiosFetch(url, {
    method: method,
    data: submitValues,
  })
    .then((resp) => {
      const patientPageUrl = '/patients/' + resp.data['patientId'];
      if (creatingNew) {
        navigate(patientPageUrl, { replace: true });
      } else {
        navigate(patientPageUrl);
      }
    })
    .catch((errorCode: number) => {
      setSubmitError(true);
      setSubmitting(false);
      if (setErrorMessage && errorCode === 409) {
        setErrorMessage(
          'Failed to create pregnancy due to a conflict with the current pregnancy or previous pregnancies.'
        );
      }
      return false;
    });
  return true;
};
