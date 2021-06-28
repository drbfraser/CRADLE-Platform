import { apiFetch, API_URL } from 'src/shared/api';
import {
  EndpointEnum,
  GestationalAgeUnitEnum,
  SexEnum,
} from 'src/shared/enums';
import { initialState, PatientField, PatientState } from './state';
import {
  getDOBForEstimatedAge,
  getTimestampFromMonths,
  getTimestampFromWeeksDays,
  goBackWithFallback,
} from 'src/shared/utils';

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
    switch (submitValues.gestationalAgeUnit) {
      case GestationalAgeUnitEnum.WEEKS:
        submitValues.pregnancyStartDate = getTimestampFromWeeksDays(
          values.gestationalAgeWeeks,
          values.gestationalAgeDays
        );
        break;
      case GestationalAgeUnitEnum.MONTHS:
        submitValues.pregnancyStartDate = getTimestampFromMonths(
          values.gestationalAgeMonths
        );
        break;
    }
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

  try {
    const resp = await apiFetch(url, {
      method: method,
      body: JSON.stringify(submitValues),
    });

    const respJson = await resp.json();
    const patientPageUrl = '/patients/' + respJson['patientId'];

    if (creatingNew) {
      history.replace(patientPageUrl);
    } else {
      goBackWithFallback(patientPageUrl);
    }
  } catch (e) {
    console.error(e);
    setSubmitError(true);
    setSubmitting(false);
    return false;
  }
  return true;
};

export const handlePregnancyInfo = async (
  pregnancyId: string | undefined,
  creatingNewPregnancy: boolean,
  values: PatientState,
  setSubmitError: React.Dispatch<React.SetStateAction<any>>,
  setSubmitting: React.Dispatch<React.SetStateAction<any>>
) => {
  setSubmitting(true);

  const submitValues = {
    patientId: values[PatientField.patientId],
    gestationalAgeUnit: values[PatientField.gestationalAgeUnit],
    pregnancyStartDate: 0,
    pregnancyEndDate: values[PatientField.pregnancyEndDate] || undefined,
    pregnancyOutcome: values[PatientField.pregnancyOutcome],
  };

  switch (submitValues.gestationalAgeUnit) {
    case GestationalAgeUnitEnum.WEEKS:
      submitValues.pregnancyStartDate = getTimestampFromWeeksDays(
        values.gestationalAgeWeeks,
        values.gestationalAgeDays
      );
      break;
    case GestationalAgeUnitEnum.MONTHS:
      submitValues.pregnancyStartDate = getTimestampFromMonths(
        values.gestationalAgeMonths
      );
      break;
  }

  if (values[PatientField.pregnancyEndDate]) {
    submitValues.pregnancyEndDate = (
      Date.parse(values[PatientField.pregnancyEndDate]) / 1000
    ).toString();
  } else {
    submitValues.pregnancyEndDate = undefined;
  }

  let method = 'POST';
  let url =
    API_URL +
    EndpointEnum.PATIENTS +
    '/' +
    values[PatientField.patientId] +
    EndpointEnum.PREGNANCIES;
  if (!creatingNewPregnancy) {
    method = 'PUT';
    url = API_URL + EndpointEnum.PREGNANCIES + '/' + pregnancyId;
  }

  try {
    const resp = await apiFetch(url, {
      method: method,
      body: JSON.stringify(submitValues),
    });

    const respJson = await resp.json();
    const patientPageUrl = '/patients/' + respJson['patientId'];
    goBackWithFallback(patientPageUrl);
  } catch (e) {
    console.error(e);
    setSubmitError(true);
    setSubmitting(false);
    return false;
  }
  return true;
};

export const handleMedicalRecordInfo = async (
  values: PatientState,
  isDrugRecord: boolean | undefined,
  setSubmitError: React.Dispatch<React.SetStateAction<any>>,
  setSubmitting: React.Dispatch<React.SetStateAction<any>>
) => {
  setSubmitting(true);

  const submitValues = isDrugRecord
    ? {
        patientId: values[PatientField.patientId],
        drugHistory: values[PatientField.drugHistory],
      }
    : {
        patientId: values[PatientField.patientId],
        medicalHistory: values[PatientField.medicalHistory],
      };

  const url =
    API_URL +
    EndpointEnum.PATIENTS +
    '/' +
    values[PatientField.patientId] +
    EndpointEnum.MEDICAL_RECORDS;

  try {
    const resp = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(submitValues),
    });

    const respJson = await resp.json();
    const patientPageUrl = '/patients/' + respJson['patientId'];
    goBackWithFallback(patientPageUrl);
  } catch (e) {
    console.error(e);
    setSubmitError(true);
    setSubmitting(false);
    return false;
  }
  return true;
};
