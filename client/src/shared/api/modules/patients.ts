//move all patients apis to here 
//import core function from core http.ts 
import { axiosFetch } from '../core/http'
import {
  Patient,
  PatientPregnancyInfo,
  PatientStatistics,
  FilterRequestBody,
  Referral,
  Pregnancy,
} from '../../types'
import { EndpointEnum } from 'src/shared/enums'

//Patients CRUD 
export const getPatientTableEntries = async () => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.PATIENTS,
  });
  return response.data;
};
export const getPatientAsync = async (patientId: string) => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.PATIENTS + `/${patientId}`,
  });
  return response.data;
};

export const getPatientsAdminAsync = async (
  includeArchived: boolean
): Promise<Patient[]> => {
  try {
    const response = await axiosFetch({
      url:
        EndpointEnum.PATIENTS +
        '/admin' +
        `?includeArchived=${includeArchived}`,
    });
    return response.data;
  } catch (e) {
    console.error(`Error fetching patients for admin: ${e}`);
    throw e;
  }
};

export const archivePatientAsync = async (patientId: string) => {
  await axiosFetch({
    method: 'PUT',
    url: EndpointEnum.PATIENTS + '/' + patientId + '/archive?archive=true',
  });
};

export const unarchivePatientAsync = async (patientId: string) => {
  await axiosFetch({
    url: EndpointEnum.PATIENTS + '/' + patientId + '/archive?archive=false',
    method: 'PUT',
  });
};

//dashboards
export const getPatientStatisticsAsync = async (
  patientId: string
): Promise<PatientStatistics> => {
  try {
    const response = await axiosFetch.get(
      EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.STATISTICS
    );
    return response.data;
  } catch (e) {
    console.error(`Error loading patient statistics: ${e}`);
    throw e;
  }
};

export const getPatientPregnancySummaryAsync = async (
  patientId: string
): Promise<PatientPregnancyInfo> => {
  try {
    const response = await axiosFetch.get(
      EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.PREGNANCY_SUMMARY
    );
    return response.data;
  } catch (e) {
    console.error(`Error loading patient pregnancy history: ${e}`);
    throw e;
  }
};
// records / timelines
export const getPatientTimelineAsync = async (patientId: string, page = 1) => {
  return (
    await axiosFetch({
      url:
        EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.PATIENT_TIMELINE,
      method: 'GET',
      params: {
        limit: '20',
        page: page.toString(),
      },
    })
  ).data;
};

export const getPatientRecordsAsync = async (
  patientId: string,
  filterRequestBody: FilterRequestBody
) => {
  try {
    const response = await axiosFetch.get(
      `${EndpointEnum.PATIENTS}/${patientId}/get_all_records?readings=${filterRequestBody.readings ? 1 : 0
      }&referrals=${filterRequestBody.referrals ? 1 : 0}&assessments=${filterRequestBody.assessments ? 1 : 0
      }&forms=${filterRequestBody.forms ? 1 : 0}`
    );
    return response.data;
  } catch (e) {
    console.error(`Error loading patient records: ${e}`);
    throw e;
  }
};

//pregnancies
export const getPatientPregnanciesAsync = async (
  patientId: string
): Promise<Pregnancy[]> => {
  try {
    const response = await axiosFetch.get(`/patients/${patientId}/pregnancies`);
    return await response.data;
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
//referrals helper
export const getPatientReferralsAsync = async (
  patientId: string
): Promise<Referral[]> => {
  try {
    const response = await axiosFetch.get(
      EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.REFERRALS
    );
    return response.data;
  } catch (e) {
    console.error(`Error loading patient referrals: ${e}`);
    throw e;
  }
};

//get patient info
export const getPatientInfoAsync = async (
  patientId: string
): Promise<Patient> => {
  const response = await axiosFetch.get(
    EndpointEnum.PATIENTS + `/${patientId}` + '/info'
  );
  return response.data;
};

