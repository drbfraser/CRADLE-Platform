import {
  getDOBForEstimatedAge,
  getTimestampFromMonths,
  getTimestampFromWeeksDays,
  goBackWithFallback,
} from 'src/shared/utils';
import { initialState, PatientField, PatientState } from './state';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { GestationalAgeUnitEnum, SexEnum } from 'src/shared/enums';

// custom change handler when a field might affect other fields
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

export const handleBlurPatientId = (
  handleBlur: any,
  setExistingPatientId: (val: string | null) => void
) => {
  return (e: any) => {
    handleBlur(e);

    const patientId = e.target.value;
    if (patientId.length !== 0) {
      apiFetch(
        API_URL +
          EndpointEnum.PATIENTS +
          '/' +
          patientId +
          EndpointEnum.PATIENT_INFO
      )
        .then((resp) =>
          setExistingPatientId(resp.status === 200 ? patientId : null)
        )
        .catch(() => {
          setExistingPatientId(null);
        });
    } else {
      setExistingPatientId(null);
    }
  };
};

export const handleSubmit = (
  creatingNew: boolean,
  history: any,
  setSubmitError: (error: boolean) => void
) => {
  return async (values: PatientState, { setSubmitting }: any) => {
    setSubmitting(true);

    const valuesForServer = {
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
      gestationalTimestamp: 0,
      drugHistory: values[PatientField.drugHistory],
      medicalHistory: values[PatientField.medicalHistory],
      allergy: values[PatientField.allergy],
    };

    if (!valuesForServer.isExactDob) {
      valuesForServer.dob = getDOBForEstimatedAge(
        parseInt(values[PatientField.estimatedAge])
      );
    }

    if (valuesForServer.isPregnant) {
      switch (valuesForServer.gestationalAgeUnit) {
        case GestationalAgeUnitEnum.WEEKS:
          valuesForServer.gestationalTimestamp = getTimestampFromWeeksDays(
            values.gestationalAgeWeeks,
            values.gestationalAgeDays
          );
          break;
        case GestationalAgeUnitEnum.MONTHS:
          valuesForServer.gestationalTimestamp = getTimestampFromMonths(
            values.gestationalAgeMonths
          );
          break;
      }
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
        body: JSON.stringify(valuesForServer),
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
    }
  };
};
