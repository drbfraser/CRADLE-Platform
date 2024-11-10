import {
  AssessmentField,
  AssessmentState,
} from 'src/pages/assessmentForm/state';
import {
  CForm,
  FilterRequestBody,
  FormTemplate,
  FormTemplateWithQuestions,
  Facility,
  RelayNum,
  VHT,
  MedicalRecord,
  NewAssessment,
  PatientMedicalInfo,
  PatientPregnancyInfo,
  PatientStatistics,
  Pregnancy,
  Referrer,
} from '../types';
import { EndpointEnum, MethodEnum, UserRoleEnum } from '../enums';

import { IExportStatRow } from 'src/pages/statistics/utils';
import { PasswordField } from 'src/app/topBar/changePassword/state';
import { PostBody } from 'src/pages/customizedForm/customizedEditForm/handlers';
import { jwtDecode } from 'jwt-decode';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import { reduxStore } from 'src/redux/store';
import { showMessage } from 'src/redux/actions/messageActions';
import { axiosFetch } from './fetch';
import { User } from './validation/user';
import axios from 'axios';

export const API_URL =
  process.env.NODE_ENV === `development`
    ? `http://${window.location.hostname}:5000/api`
    : '/api';

export const getApiToken = async () => {
  let accessToken = localStorage.getItem(`accessToken`);

  try {
    const decodedToken = accessToken
      ? jwtDecode<{ exp: number }>(accessToken)
      : null;
    const currentTime = new Date().getTime() / 1000;

    // If access token is expired, we must fetch a new one.
    const shouldRefreshToken =
      !decodedToken || currentTime > decodedToken.exp + 30;

    if (shouldRefreshToken) {
      /* Refresh token is stored in HTTP-Only cookie. It should automatically be
      sent along with our request to the refresh_token endpoint.
      */
      const init = {
        method: MethodEnum.POST,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };

      const resp = await fetch(`${API_URL}${EndpointEnum.REFRESH}`, init);

      if (!resp.ok) {
        console.error(
          `ERROR (${resp.status}): Failed to get new access token.`,
          resp
        );
        throw new Error();
      }

      accessToken = (await resp.json()).data.access_token;
      localStorage.setItem('access_token', accessToken!);
    }
  } catch (e) {
    console.error(e);
    reduxStore.dispatch(logoutUser());
  }
  return accessToken;
};

export const apiFetch = async (
  url: string,
  init?: RequestInit | undefined,
  isFormData?: boolean,
  needErrorInfo?: boolean
): Promise<Response> => {
  const accessToken = await getApiToken();
  const contentType = isFormData
    ? undefined
    : {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

  console.log('RequestInit:', init);
  console.log('RequestInput:', url);

  return fetch(url, {
    ...init,
    headers: {
      ...contentType,
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  }).then((resp) => {
    if (!resp.ok) {
      throw needErrorInfo ? resp : resp.status;
    }
    return resp;
  });
};

export const changePasswordAsync = async (
  currentPass: string,
  newPass: string
) => {
  // const init = {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     [PasswordField.currentPass]: currentPass,
  //     [PasswordField.newPass]: newPass,
  //   }),
  // };
  return axiosFetch({
    endpoint: EndpointEnum.CHANGE_PASS,
    method: 'POST',
    data: {
      [PasswordField.currentPass]: currentPass,
      [PasswordField.newPass]: newPass,
    },
  });
  // return apiFetch(API_URL + EndpointEnum.CHANGE_PASS, init);
};

export const saveHealthFacilityAsync = async (facility: Facility) => {
  return axiosFetch({
    method: 'POST',
    endpoint: EndpointEnum.HEALTH_FACILITIES,
    data: facility,
  });
  // return apiFetch(API_URL + EndpointEnum.HEALTH_FACILITIES, {
  //   method: 'POST',
  //   body: JSON.stringify(facility),
  // });
};

export const getHealthFacilitiesAsync = async (): Promise<Facility[]> => {
  // const response = await apiFetch(API_URL + EndpointEnum.HEALTH_FACILITIES);
  const response = await axiosFetch({
    method: 'GET',
    endpoint: EndpointEnum.HEALTH_FACILITIES,
  });

  return response.data;
  // return response.json();
};

export const getHealthFacilityAsync = async (
  healthFacility?: string
): Promise<Facility> => {
  // const response = await apiFetch(
  //   API_URL + EndpointEnum.HEALTH_FACILITIES + `/${healthFacility}`
  // );
  const response = await axiosFetch({
    method: 'GET',
    endpoint: EndpointEnum.HEALTH_FACILITIES + `/${healthFacility}`,
  });

  return response.data;
};

export const handleArchiveFormTemplateAsync = async (template: FormTemplate) =>
  apiFetch(
    API_URL + EndpointEnum.FORM_TEMPLATES + '/' + template.id,
    {
      method: 'PUT',
      body: JSON.stringify(template),
    },
    false
  );

export const saveFormTemplateWithFileAsync = async (file: File) => {
  const data: FormData = new FormData();
  data.append('file', file);

  return apiFetch(
    API_URL + EndpointEnum.FORM_TEMPLATES,
    {
      method: 'POST',
      body: data,
    },
    true,
    true
  );
};

export const submitFormTemplateAsync = async (
  form: FormTemplateWithQuestions
) => {
  return apiFetch(
    API_URL + EndpointEnum.FORM_TEMPLATES,
    {
      method: 'POST',
      body: JSON.stringify(form),
    },
    true,
    true
  );
};

export const getFormClassificationTemplates = async (
  formClassificationId: string
) =>
  (
    await apiFetch(
      API_URL +
        EndpointEnum.FORM_CLASSIFICATIONS +
        '/' +
        formClassificationId +
        '/templates'
    )
  ).json();

export const getAllFormTemplatesAsync = async (
  includeArchived: boolean
): Promise<FormTemplate[]> =>
  (
    await apiFetch(
      API_URL +
        EndpointEnum.FORM_TEMPLATES +
        `?includeArchived=${includeArchived}`
    )
  ).json();

export const getFormTemplateAsync = async (formTemplateId: string) =>
  (
    await apiFetch(API_URL + EndpointEnum.FORM_TEMPLATES + `/${formTemplateId}`)
  ).json();

export const getFormTemplateLangAsync = async (
  formTemplateId: string,
  lang: string
) =>
  (
    await apiFetch(
      API_URL + EndpointEnum.FORM_TEMPLATES + `/${formTemplateId}?lang=${lang}`
    )
  ).json();

export const getFormTemplateLangsAsync = async (formTemplateId: string) =>
  (
    await apiFetch(
      API_URL + EndpointEnum.FORM_TEMPLATES + `/${formTemplateId}/versions`
    )
  ).json();

export const getFormTemplateCsvAsync = async (
  formTemplateId: string,
  version: string
): Promise<Blob> => {
  const response = await apiFetch(
    API_URL +
      EndpointEnum.FORM_TEMPLATES +
      `/${formTemplateId}/versions/${version}/csv`
  );

  return response.blob();
};

export const uploadAppFileAsync = async (file: File) => {
  const data = new FormData();
  data.append('file', file);
  return apiFetch(
    API_URL + EndpointEnum.UPLOAD_ADMIN,
    {
      method: 'POST',
      body: data,
    },
    true
  );
};

export const getAppFileAsync = async (): Promise<Blob> =>
  (
    await apiFetch(API_URL + EndpointEnum.UPLOAD_ADMIN + '?' + Date.now())
  ).blob();

export const getAppFileHeadAsync = async () =>
  apiFetch(API_URL + EndpointEnum.UPLOAD_ADMIN + '?' + Date.now(), {
    method: 'HEAD',
  });

export const deleteUserAsync = async (user: User) =>
  apiFetch(API_URL + EndpointEnum.USER + String(user.id), {
    method: 'DELETE',
  });

export const saveUserAsync = async (user: User, userId: number | undefined) => {
  const url =
    API_URL +
    (userId ? EndpointEnum.USER + userId : EndpointEnum.USER_REGISTER);

  const init: RequestInit = {
    method: userId ? 'PUT' : 'POST',
    body: JSON.stringify({
      ...user,
      supervises: user.role === UserRoleEnum.CHO ? user.supervises : [],
    }),
  };

  return apiFetch(url, init, false, true);
};

export const getUsersAsync = async (): Promise<User[]> => {
  // const res = await apiFetch(API_URL + EndpointEnum.USER_ALL);
  const res = await axiosFetch({
    method: 'GET',
    endpoint: EndpointEnum.USER_ALL,
  });
  const users = await res.data;
  /* Since much of the front-end was created with users only having a single 
  phone number, set the users 'phoneNumber' attribute to be the first 
  phone number in the 'phoneNumbers' array. */
  return users.map((user: User) => {
    user.phoneNumber = user.phoneNumbers.length > 0 ? user.phoneNumbers[0] : '';
    return user;
  });
};

export const resetUserPasswordAsync = async (user: User, password: string) => {
  // const url =
  //   API_URL + EndpointEnum.USER + String(user.id) + EndpointEnum.RESET_PASS;
  const url = EndpointEnum.USER + String(user.id) + EndpointEnum.RESET_PASS;

  // const init = {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     [UserField.password]: password,
  //   }),
  // };
  return axiosFetch({
    method: 'POST',
    endpoint: url,
    data: { password: password },
  });
  // return apiFetch(url, init);
};

export const saveAssessmentAsync = async (
  assessment: NewAssessment,
  assessmentId: string | undefined,
  patientId: string
) => {
  let url = API_URL + EndpointEnum.ASSESSMENTS;
  let method = 'POST';

  if (assessmentId !== undefined) {
    url += `/${assessmentId}`;
    method = 'PUT';
  }

  return apiFetch(url, {
    method,
    body: JSON.stringify({
      patientId,
      ...assessment,
    }),
  });
};

export const getAssessmentAsync = async (
  assessmentId: string
): Promise<AssessmentState> => {
  // const resp = await apiFetch(
  //   API_URL + EndpointEnum.ASSESSMENTS + '/' + assessmentId
  // );
  const resp = await axiosFetch({
    method: 'GET',
    endpoint: EndpointEnum.ASSESSMENTS + '/' + assessmentId,
  });

  // return resp.json();
  return resp.data;
};

export const saveDrugHistoryAsync = async (
  drugHistory: string,
  patientId: string
) =>
  apiFetch(
    API_URL +
      EndpointEnum.PATIENTS +
      `/${patientId}` +
      EndpointEnum.MEDICAL_RECORDS,
    {
      method: 'POST',
      body: JSON.stringify({
        [AssessmentField.drugHistory]: drugHistory,
      }),
    }
  );

export const getDrugHistoryAsync = async (patientId: string) => {
  const response = await apiFetch(
    API_URL +
      EndpointEnum.PATIENTS +
      `/${patientId}` +
      EndpointEnum.MEDICAL_HISTORY
  );

  const assessment = await response.json();

  return assessment.drugHistory;
};

export const saveReferralAssessmentAsync = async (referralId: string) =>
  apiFetch(API_URL + EndpointEnum.REFERRALS + `/assess/${referralId}`, {
    method: 'PUT',
  });

export const saveFormResponseAsync = async (
  postBody: PostBody,
  formId?: string
) => {
  const url = API_URL + EndpointEnum.FORM + (formId ? '/' + formId : '');

  const init = {
    method: formId ? 'PUT' : 'POST',
    body: JSON.stringify(
      formId ? { questions: postBody.edit } : postBody.create
    ),
  };

  return apiFetch(url, init, false);
};

export const getFormResponseAsync = async (formId: string): Promise<CForm> => {
  const response = await apiFetch(API_URL + EndpointEnum.FORM + `/${formId}`);

  return response.json();
};

export const getPatientTimelineAsync = async (
  patientId: string,
  page = 1
): Promise<[]> => {
  const params = new URLSearchParams({
    limit: '20',
    page: page.toString(),
  });

  return (
    await apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.PATIENT_TIMELINE +
        '?' +
        params
    )
  ).json();
};

export const getPregnancyAsync = async (pregnancyId: string) => {
  const response = await apiFetch(
    API_URL + EndpointEnum.PREGNANCIES + `/${pregnancyId}`
  );
  return response.json();
};

export const deletePregnancyAsync = async (pregnancy: Pregnancy) =>
  apiFetch(API_URL + EndpointEnum.PREGNANCIES + `/${pregnancy.pregnancyId}`, {
    method: 'DELETE',
  });

export const deleteMedicalRecordAsync = async (medicalRecord: MedicalRecord) =>
  apiFetch(
    API_URL +
      EndpointEnum.MEDICAL_RECORDS +
      `/${medicalRecord.medicalRecordId}`,
    {
      method: 'DELETE',
    }
  );

export const getPatientMedicalRecordsAsync = async (patientId: string) => {
  const response = await apiFetch(
    `${API_URL}/patients/${patientId}/medical_records`
  );
  const data = await response.json();
  return data.medical as MedicalRecord[];
};

export const getPatientDrugRecordsAsync = async (patientId: string) => {
  const response = await apiFetch(
    `${API_URL}/patients/${patientId}/medical_records`
  );
  const data = await response.json();
  return data.drug as MedicalRecord[];
};

export const getMedicalRecordAsync = async (medicalRecordId: string) => {
  apiFetch(API_URL + EndpointEnum.MEDICAL_RECORDS + `/${medicalRecordId}`);
};
export const getPatientMedicalHistoryAsync = async (
  patientId: string
): Promise<PatientMedicalInfo> => {
  const response = await apiFetch(
    API_URL +
      EndpointEnum.PATIENTS +
      `/${patientId}` +
      EndpointEnum.MEDICAL_HISTORY
  );

  return response.json();
};

export const getAllPatientsAsync = async () => {
  // const response = await apiFetch(API_URL + EndpointEnum.PATIENTS);

  // return response.json();
  const response = await axiosFetch({
    method: 'GET',
    endpoint: EndpointEnum.PATIENTS,
  });
  return response.data;
};

export const getPatientsAdminAsync = async (includeArchived: boolean) => {
  const response = await apiFetch(
    API_URL +
      EndpointEnum.PATIENTS +
      '/admin' +
      `?includeArchived=${includeArchived}`
  );

  return response.json();
};

export const archivePatientAsync = async (patientId: string) => {
  const response = await apiFetch(
    API_URL + EndpointEnum.PATIENTS + '/' + patientId + '/info',
    {
      method: 'PUT',
      body: JSON.stringify({
        isArchived: true,
      }),
    }
  );

  return response.json();
};

export const unarchivePatientAsync = async (patientId: string) => {
  const response = await apiFetch(
    API_URL + EndpointEnum.PATIENTS + '/' + patientId + '/info',
    {
      method: 'PUT',
      body: JSON.stringify({
        isArchived: false,
      }),
    }
  );

  return response.json();
};

export const getPatientAsync = async (patientId: string) => {
  try {
    const response = await apiFetch(
      API_URL + EndpointEnum.PATIENTS + `/${patientId}`
    );
    return response.json();
  } catch (error: any) {
    if (error.status === 403) {
      reduxStore.dispatch(
        showMessage(
          "User is not authorized to access this patient's information"
        )
      );
    }
    // Handle other error cases if necessary
    throw error;
  }
};

export const getPatientInfoAsync = async (patientId: string) => {
  const response = await apiFetch(
    API_URL + EndpointEnum.PATIENTS + `/${patientId}` + '/info'
  );

  return response.json();
};

export const getPatientPregnanciesAsync = async (patientId: string) => {
  const response = await apiFetch(
    `${API_URL}/patients/${patientId}/pregnancies`
  );
  const data = await response.json();
  return data as Pregnancy[];
};

export const getPatientRecordsAsync = async (
  patientId: string,
  filterRequestBody: FilterRequestBody
) => {
  const response = await apiFetch(
    `${API_URL}${EndpointEnum.PATIENTS}/${patientId}/get_all_records?readings=${
      filterRequestBody.readings ? 1 : 0
    }&referrals=${filterRequestBody.referrals ? 1 : 0}&assessments=${
      filterRequestBody.assessments ? 1 : 0
    }&forms=${filterRequestBody.forms ? 1 : 0}`
  );
  return response.json();
};

export const getPatientReferralsAsync = async (patientId: string) => {
  const response = await apiFetch(
    API_URL + EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.REFERRALS
  );

  return response.json();
};

export const getPatientStatisticsAsync = async (
  patientId: string
): Promise<PatientStatistics> => {
  const response = await apiFetch(
    API_URL + EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.STATISTICS
  );

  return response.json();
};

export const getPatientPregnancySummaryAsync = async (
  patientId: string
): Promise<PatientPregnancyInfo> => {
  const response = await apiFetch(
    API_URL +
      EndpointEnum.PATIENTS +
      `/${patientId}` +
      EndpointEnum.PREGNANCY_SUMMARY
  );

  return response.json();
};

export const getPatientPregnancyInfoAsync = async (
  patientId: string
): Promise<PatientPregnancyInfo> => {
  const response = await apiFetch(
    API_URL +
      EndpointEnum.PATIENTS +
      '/' +
      patientId +
      EndpointEnum.PATIENT_INFO
  );

  return response.json();
};

export const saveReadingAsync = async (reading: any) => {
  const response = await apiFetch(API_URL + EndpointEnum.READINGS, {
    method: 'POST',
    body: JSON.stringify(reading),
  });

  return response.json();
};

export const saveReferralAsync = async (referral: any) => {
  const response = await apiFetch(
    API_URL + EndpointEnum.REFERRALS,
    {
      method: 'POST',
      body: JSON.stringify(referral),
    },
    false,
    true
  );

  return response.json();
};

export const getUserVhtsAsync = async (): Promise<Referrer[]> => {
  // const response = await apiFetch(API_URL + EndpointEnum.USER_VHTS);

  // return response.json();

  const response = await axiosFetch({
    method: 'GET',
    endpoint: EndpointEnum.USER_VHTS,
  });
  return response.data;
};

export const getVHTsAsync = async (): Promise<VHT[]> => {
  // const response = await apiFetch(API_URL + EndpointEnum.ALL_VHTS);

  // return response.json();
  const response = await axiosFetch({
    method: 'GET',
    endpoint: EndpointEnum.ALL_VHTS,
  });
  return response.data;
};

export const setReferralCancelStatusAsync = async (
  referralId: string,
  comment: string,
  isCancelled: boolean
) =>
  await apiFetch(
    API_URL + EndpointEnum.REFERRALS + '/cancel-status-switch/' + referralId,
    {
      method: 'PUT',
      body: JSON.stringify({
        cancelReason: comment,
        isCancelled,
      }),
    }
  );

export const setReferralNotAttendedAsync = async (
  referralId: string,
  comment: string
) =>
  await apiFetch(
    API_URL + EndpointEnum.REFERRALS + '/not-attend/' + referralId,
    {
      method: 'PUT',
      body: JSON.stringify({
        notAttendReason: comment,
      }),
    }
  );

export const getUserStatisticsExportAsync = async (
  user: string,
  from: number,
  to: number
): Promise<IExportStatRow[]> => {
  const response = await apiFetch(
    API_URL + EndpointEnum.STATS_USER_EXPORT + `/${user}?from=${from}&to=${to}`
  );

  return response.json();
};

export const getUserStatisticsAsync = async (
  user: string,
  from: number,
  to: number
): Promise<IExportStatRow[]> => {
  const response = await apiFetch(
    API_URL + EndpointEnum.STATS_USER + `/${user}?from=${from}&to=${to}`
  );

  return response.json();
};

export const getFacilityStatisticsAsync = async (
  facility: string,
  from: number,
  to: number
): Promise<IExportStatRow[]> => {
  const response = await apiFetch(
    API_URL + EndpointEnum.STATS_FACILITY + `/${facility}?from=${from}&to=${to}`
  );

  return response.json();
};

export const getAllStatisticsAsync = async (
  from: number,
  to: number
): Promise<IExportStatRow[]> => {
  const response = await apiFetch(
    API_URL + EndpointEnum.STATS_ALL + `?from=${from}&to=${to}`
  );

  return response.json();
};

export const getSecretKeyAsync = async (userId: number) => {
  // const response = await apiFetch(
  //   API_URL + `/user/${userId}` + EndpointEnum.SECRETKEY,
  //   {
  //     method: MethodEnum.GET,
  //   }
  // );
  // return response.json();
  const response = await axiosFetch({
    method: 'GET',
    endpoint: `/user/${userId}` + EndpointEnum.SECRETKEY,
  });
  return response.data;
};

export const updateSecretKeyAsync = async (userId: number) => {
  // const response = await apiFetch(
  //   API_URL + `/user/${userId}` + EndpointEnum.SECRETKEY,
  //   {
  //     method: MethodEnum.PUT,
  //   }
  // );
  const response = await axiosFetch({
    method: 'PUT',
    endpoint: `/user/${userId}` + EndpointEnum.SECRETKEY,
  });
  return response.data;
};

export const addRelayServerPhone = async (
  phone: string,
  description: string
) => {
  const response = await apiFetch(API_URL + EndpointEnum.RELAY_SERVER_PHONE, {
    method: MethodEnum.POST,
    body: JSON.stringify({
      phone: phone,
      description: description,
    }),
  });
  return response.json();
};

export const getRelayServerPhones = async () =>
  (await apiFetch(API_URL + EndpointEnum.RELAY_SERVER_PHONE)).json();

export const saveRelayNumAsync = async (relayNum: RelayNum) => {
  apiFetch(API_URL + EndpointEnum.RELAY_SERVER_PHONE, {
    method: MethodEnum.PUT,
    body: JSON.stringify(relayNum),
  });
};

export const deleteRelayNumAsync = async (relayNum: RelayNum) => {
  apiFetch(API_URL + EndpointEnum.RELAY_SERVER_PHONE, {
    method: MethodEnum.DELETE,
    body: JSON.stringify(relayNum),
  });
};
