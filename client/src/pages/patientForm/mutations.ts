import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL, axiosFetch } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { PregnancySubmitValues } from './components/pregnancyInfo/utils';
import { PatientData } from './components/EditPersonalInfoForm';

const createPregnancyURL = (pregnancyId: string) =>
  API_URL + EndpointEnum.PREGNANCIES + `/${pregnancyId}`;

const createPatientMedicalRecordsURL = (patientId: string) =>
  API_URL +
  EndpointEnum.PATIENTS +
  `/${patientId}` +
  EndpointEnum.MEDICAL_RECORDS;

export const useUpdatePatientMutation = (patientId: string) => {
  const endpoint =
    API_URL +
    EndpointEnum.PATIENTS +
    `/${patientId}` +
    EndpointEnum.PATIENT_INFO;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientData) => {
      return axiosFetch.put(endpoint, {
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['descriptionVariables'] });
    },
  });
};

export const useAddPatientInfoMutation = () => {
  const endpoint = API_URL + EndpointEnum.PATIENTS;

  return useMutation({
    mutationFn: (data: PatientData) => {
      console.log('new patient data', data);
      return axiosFetch.post(endpoint, {
        ...data,
      });
    },
  });
};

export const useUpdatePregnancyMutation = (pregnancyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PregnancySubmitValues) => {
      return axiosFetch.put(createPregnancyURL(pregnancyId), {
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['descriptionVariables'] });
    },
  });
};

export const useDeletePregnancyMutation = (pregnancyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      return axiosFetch.delete(createPregnancyURL(pregnancyId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['descriptionVariables'] });
    },
  });
};

export const useAddPregnancyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PregnancySubmitValues) => {
      const endpoint =
        API_URL +
        EndpointEnum.PATIENTS +
        `/${data.patientId}` +
        EndpointEnum.PREGNANCIES;

      return axiosFetch
        .post(endpoint, {
          ...data,
        })
        .catch((e: AxiosError) => {
          let errorMessage = '';
          if (e.response?.status === 409) {
            errorMessage =
              'Failed to create pregnancy due to a conflict with the current pregnancy or previous pregnancies.';
          }
          throw new Error(errorMessage);
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['descriptionVariables'] });
    },
  });
};

export const useAddMedicalRecordMutation = (
  patientId: string,
  isDrugRecord: boolean
) => {
  return useMutation({
    mutationFn: (submitValues: { patientId: string; information: string }) => {
      return axiosFetch.post(createPatientMedicalRecordsURL(patientId), {
        ...submitValues,
        isDrugRecord,
      });
    },
  });
};

export const useUpdateMedicalRecordMutation = (
  patientId: string,
  isDrugRecord: boolean
) => {
  return useMutation({
    mutationFn: (submitValues: { patientId: string; information: string }) => {
      return axiosFetch.post(createPatientMedicalRecordsURL(patientId), {
        ...submitValues,
        isDrugRecord,
      });
    },
  });
};

export const useDeleteMedicalRecordMutation = (recordId: string) => {
  const endpoint = API_URL + EndpointEnum.MEDICAL_RECORDS + `/${recordId}`;

  return useMutation({
    mutationFn: () => {
      return axiosFetch.delete(endpoint);
    },
  });
};
