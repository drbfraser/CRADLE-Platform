import { AssessmentField } from 'src/pages/assessmentForm/state';
import { axiosFetch } from '../core/http';
import { MedicalRecord, PatientMedicalInfo } from '../../types';
import { EndpointEnum } from 'src/shared/enums';

export const saveDrugHistoryAsync = async (
  drugHistory: string,
  patientId: string
) =>
  axiosFetch({
    url: `${EndpointEnum.PATIENTS}/${patientId}/drug_history`,
    method: 'PUT',
    data: {
      [AssessmentField.drugHistory]: drugHistory,
    },
  });

export const getDrugHistoryAsync = async (patientId: string) => {
  const response = await axiosFetch.get(
    EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.MEDICAL_HISTORY
  );
  const assessment = response.data;
  return assessment.drugHistory;
};

export const getPatientDrugRecordsAsync = async (
  patientId: string
): Promise<MedicalRecord[]> => {
  try {
    const response = await axiosFetch.get(
      `/patients/${patientId}/medical_records`
    );
    const data = await response.data;
    return data.drug;
  } catch (e) {
    if (e instanceof Response) {
      const error = await e.json();
      console.error(error);
    } else {
      console.error(e);
    }
    throw e;
  }
};

export const getMedicalRecordAsync = async (
  medicalRecordId: string
): Promise<PatientMedicalInfo> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.MEDICAL_RECORDS + `/${medicalRecordId}`,
  });
  return response.data;
};

export const getPatientMedicalRecordsAsync = async (
  patientId: string
): Promise<MedicalRecord[]> => {
  try {
    const response = await axiosFetch.get(
      `/patients/${patientId}/medical_records`
    );
    const data = await response.data;
    return data.medical;
  } catch (e) {
    if (e instanceof Response) {
      const error = await e.json();
      console.error(error);
    } else {
      console.error(e);
    }
    throw e;
  }
};

export const deleteMedicalRecordAsync = async (medicalRecord: MedicalRecord) =>
  axiosFetch({
    url: EndpointEnum.MEDICAL_RECORDS + `/${medicalRecord.id}`,
    method: 'DELETE',
  });

export const getPatientMedicalHistoryAsync = async (
  patientId: string
): Promise<PatientMedicalInfo> => {
  try {
    const response = await axiosFetch({
      method: 'GET',
      url:
        EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.MEDICAL_HISTORY,
    });
    return response.data;
  } catch (e) {
    console.error(`Error loading patient medical history: ${e}`);
    throw e;
  }
};
