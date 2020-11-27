import {
  GESTATIONAL_AGE_UNITS,
  getDOBForEstimatedAge,
  getTimestampFromMonths,
  getTimestampFromWeeks,
} from '../../../src/shared/utils';
import { EndpointEnum } from '../../../src/server';
import { BASE_URL } from '../../../src/server/utils';
import { initialState, PatientField, PatientState, SEXES } from './state';

// custom change handler when a field might affect other fields
export const handleChangeCustom = (handleChange: any, setFieldValue: any) => {
  const resetGestational = () => {
    setFieldValue(
      PatientField.gestationalAge,
      initialState[PatientField.gestationalAge],
      false
    );
    setFieldValue(
      PatientField.gestationalAgeUnit,
      initialState[PatientField.gestationalAgeUnit],
      false
    );
  };

  return (e: React.ChangeEvent<any>) => {
    handleChange(e);

    if (
      e.target.name === PatientField.patientSex &&
      e.target.value === SEXES.MALE
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
      const fetchOptions = {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      };

      fetch(
        BASE_URL + EndpointEnum.PATIENTS + '/' + patientId + EndpointEnum.INFO,
        fetchOptions
      )
        .then((resp) =>
          setExistingPatientId(resp.status === 200 ? patientId : null)
        )
        .catch((e) => {
          console.error(e);
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

    // deep copy
    const patientData = JSON.parse(JSON.stringify(values));

    // modify the data to be what the server expects
    patientData[PatientField.isExactDob] = Boolean(
      patientData[PatientField.isExactDob]
    );

    if (!patientData[PatientField.isExactDob]) {
      patientData[PatientField.dob] = getDOBForEstimatedAge(
        patientData[PatientField.estimatedAge]
      );
    }

    if (patientData[PatientField.isPregnant]) {
      switch (patientData[PatientField.gestationalAgeUnit]) {
        case GESTATIONAL_AGE_UNITS.WEEKS:
          patientData.gestationalTimestamp = getTimestampFromWeeks(
            patientData[PatientField.gestationalAge]
          );
          break;
        case GESTATIONAL_AGE_UNITS.MONTHS:
          patientData.gestationalTimestamp = getTimestampFromMonths(
            patientData[PatientField.gestationalAge]
          );
          break;
      }
    }

    delete patientData[PatientField.estimatedAge];
    delete patientData[PatientField.gestationalAge];

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(patientData),
    };

    let url = BASE_URL + EndpointEnum.PATIENTS;

    if (!creatingNew) {
      url += '/' + patientData[PatientField.patientId] + EndpointEnum.INFO;
      fetchOptions.method = 'PUT';
    }

    try {
      const resp = await fetch(url, fetchOptions);

      if (!resp.ok) {
        throw new Error('Response failed with error code: ' + resp.status);
      }

      const respJson = await resp.json();

      history.push('/patients/' + respJson['patientId']);
    } catch (e) {
      console.error(e);
      setSubmitError(true);
    }

    setSubmitting(false);
  };
};
