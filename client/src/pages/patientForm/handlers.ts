import { apiFetch, API_URL } from 'src/shared/api';
import {
  EndpointEnum,
  GestationalAgeUnitEnum,
  SexEnum,
} from 'src/shared/enums';
import { initialState, PatientField, PatientState } from './state';
import { getDOBForEstimatedAge, goBackWithFallback } from 'src/shared/utils';
import {
  gestationalAgeUnitTimestamp,
  gestationalAgeUnitTimestampWithEndDate,
} from 'src/shared/constants';

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
  history: any,
  setSubmitError: React.Dispatch<React.SetStateAction<any>>,
  setSubmitting: React.Dispatch<React.SetStateAction<any>>
) => {
  setSubmitting(true);

  const submitValues = {
    patientId: values[PatientField.patientId],
    patientName: values[PatientField.patientName],
    householdNumber: values[PatientField.householdNumber],
    isExactDob: Boolean(values[PatientField.isExactDob]),
    dob: values[PatientField.dob],
    zone: values[PatientField.zone],
    villageNumber: values[PatientField.villageNumber],
    patientSex: values[PatientField.patientSex],
    isPregnant: Boolean(values[PatientField.isPregnant]),
    gestationalAgeUnit: values[PatientField.gestationalAgeUnit],
    pregnancyStartDate: 0,
    drugHistory: values[PatientField.drugHistory],
    medicalHistory: values[PatientField.medicalHistory],
    allergy: values[PatientField.allergy],
  };

  if (!submitValues.isExactDob) {
    submitValues.dob = getDOBForEstimatedAge(
      parseInt(values[PatientField.estimatedAge])
    );
  }

  if (submitValues.isPregnant) {
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

  //TODO: remove this when we get rid of the old information in the Patient table
  if (!submitValues.gestationalAgeUnit) {
    submitValues.gestationalAgeUnit = GestationalAgeUnitEnum.WEEKS;
  }

  let method = 'POST';
  let url = API_URL + EndpointEnum.PATIENTS;

  if (!creatingNew) {
    method = 'PUT';
    url += '/' + values[PatientField.patientId] + EndpointEnum.PATIENT_INFO;
  }

  await handleApiFetch(
    url,
    method,
    submitValues,
    creatingNew,
    history,
    setSubmitError,
    setSubmitting
  );
};

export const handlePregnancyInfo = async (
  patientId: string | undefined,
  pregnancyId: string | undefined,
  creatingNewPregnancy: boolean,
  values: PatientState,
  history: any,
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
    history,
    setSubmitError,
    setSubmitting,
    setErrorMessage
  );
};

export const handleMedicalRecordInfo = async (
  patientId: string | undefined,
  values: PatientState,
  isDrugRecord: boolean | undefined,
  history: any,
  setSubmitError: React.Dispatch<React.SetStateAction<any>>,
  setSubmitting: React.Dispatch<React.SetStateAction<any>>
) => {
  setSubmitting(true);
  const submitValues = isDrugRecord
    ? {
        drugHistory: values[PatientField.drugHistory],
      }
    : {
        medicalHistory: values[PatientField.medicalHistory],
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
    history,
    setSubmitError,
    setSubmitting
  );
};

export const handleDeleteRecord = async (
  editId: string,
  universalRecordId: string,
  history: any,
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
    history,
    setSubmitError,
    setSubmitting
  );
};

const handleApiFetch = async (
  url: string,
  method: string,
  submitValues: any,
  creatingNew: boolean,
  history: any,
  setSubmitError: React.Dispatch<React.SetStateAction<any>>,
  setSubmitting: React.Dispatch<React.SetStateAction<any>>,
  setErrorMessage?: React.Dispatch<React.SetStateAction<string>>
) => {
  apiFetch(url, {
    method: method,
    body: JSON.stringify(submitValues),
  })
    .then((resp) => resp.json())
    .then((respJson) => {
      const patientPageUrl = '/patients/' + respJson['patientId'];
      if (creatingNew) {
        history.replace(patientPageUrl);
      } else {
        goBackWithFallback(patientPageUrl);
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
