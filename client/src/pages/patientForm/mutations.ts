import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { API_URL, axiosFetch } from 'src/shared/api/api';
import { EndpointEnum } from 'src/shared/enums';
import { SubmitValues as PregnancySubmitValues } from './components/pregnancyInfo/utils';
import { PatientData } from './components/EditPersonalInfoForm';

export const useUpdatePatientMutation = (patientId: string) => {
  const endpoint =
    API_URL +
    EndpointEnum.PATIENTS +
    `/${patientId}` +
    EndpointEnum.PATIENT_INFO;

  return useMutation({
    mutationFn: (data: PatientData) => {
      return axiosFetch(endpoint, {
        method: 'PUT',
        data,
      });
    },
  });
};

export const useAddPatientInfoMutation = () => {
  const endpoint = API_URL + EndpointEnum.PATIENTS;

  return useMutation({
    mutationFn: (data: PatientData) => {
      return axiosFetch(endpoint, { method: 'POST', data });
    },
  });
};

export const useUpdatePregnancyMutation = (pregnancyId: string) => {
  const endpoint = API_URL + EndpointEnum.PREGNANCIES + `/${pregnancyId}`;

  return useMutation({
    mutationFn: (data: PregnancySubmitValues) => {
      return axiosFetch(endpoint, { method: 'PUT', data });
    },
  });
};

export const useDeletePregnancyMutation = (pregnancyId: string) => {
  const endpoint = API_URL + EndpointEnum.PREGNANCIES + `/${pregnancyId}`;

  return useMutation({
    mutationFn: () => {
      return axiosFetch(endpoint, { method: 'DELETE' });
    },
  });
};

export const useAddPregnancyMutation = () => {
  return useMutation({
    mutationFn: (data: PregnancySubmitValues) => {
      const endpoint =
        API_URL +
        EndpointEnum.PATIENTS +
        `/${data.patientId}` +
        EndpointEnum.PREGNANCIES;

      return axiosFetch(endpoint, { method: 'POST', data }).catch(
        (e: AxiosError) => {
          let errorMessage = '';
          if (e.response?.status === 409) {
            errorMessage =
              'Failed to create pregnancy due to a conflict with the current pregnancy or previous pregnancies.';
          }
          throw new Error(errorMessage);
        }
      );
    },
  });
};

export const useAddMedicalRecordMutation = (
  patientId: string,
  isDrugRecord: boolean
) => {
  const endpoint =
    API_URL +
    EndpointEnum.PATIENTS +
    `/${patientId}` +
    EndpointEnum.MEDICAL_RECORDS;

  return useMutation({
    mutationFn: (submitValues: { patientId: string; information: string }) => {
      return axiosFetch(endpoint, {
        method: 'POST',
        data: { ...submitValues, isDrugRecord },
      });
    },
  });
};

export const useUpdateMedicalRecordMutation = (
  patientId: string,
  isDrugRecord: boolean
) => {
  const endpoint =
    API_URL +
    EndpointEnum.PATIENTS +
    `/${patientId}` +
    EndpointEnum.MEDICAL_RECORDS;

  return useMutation({
    mutationFn: (submitValues: { patientId: string; information: string }) => {
      return axiosFetch(endpoint, {
        method: 'POST',
        data: { ...submitValues, isDrugRecord },
      });
    },
  });
};

export const useDeleteMedicalRecordMutation = (recordId: string) => {
  const endpoint = API_URL + EndpointEnum.MEDICAL_RECORDS + `/${recordId}`;

  return useMutation({
    mutationFn: () => {
      return axiosFetch(endpoint, { method: 'DELETE' });
    },
  });
};
