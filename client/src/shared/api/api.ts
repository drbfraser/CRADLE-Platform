import { AssessmentField } from 'src/pages/assessmentForm/state';
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
  Pregnancy,
  Referrer,
} from '../types';
import { EndpointEnum, MethodEnum, UserRoleEnum } from '../enums';
import axios, { AxiosError } from 'axios';
import { IExportStatRow } from 'src/pages/statistics/utils';
import { PostBody } from 'src/pages/customizedForm/customizedEditForm/handlers';
import { reduxStore } from 'src/redux/store';
import { showMessage } from 'src/redux/actions/messageActions';
import { EditUser, NewUser, User } from './validation/user';
import { jwtDecode } from 'jwt-decode';
import { logoutUser } from 'src/redux/reducers/user/currentUser';

export const API_URL =
  process.env.NODE_ENV === `development`
    ? `http://${window.location.hostname}:5000/api`
    : '/api';

// Create an axios instance to apply default configs to.
export const axiosFetch = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Necessary for cookies.
});

export const getApiToken = async () => {
  let accessToken = localStorage.getItem(`accessToken`);

  if (!accessToken) {
    reduxStore.dispatch(logoutUser());
    return null;
  }

  try {
    const decodedToken = accessToken
      ? jwtDecode<{ exp: number; username: string }>(accessToken)
      : null;
    const currentTime = new Date().getTime() / 1000;

    // If access token is expired, we must fetch a new one.
    const shouldRefreshToken =
      !decodedToken || currentTime > decodedToken.exp - 60;

    if (shouldRefreshToken) {
      const username = decodedToken?.username;
      /** Refresh token is stored in HTTP-Only cookie. It should automatically
       *  be sent along with our request to the refresh_token endpoint. */
      const response = await axiosFetch({
        method: 'POST',
        url: EndpointEnum.REFRESH,
        withCredentials: true, // Necessary for cookies.
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          /* Username is needed for the server to get a new access token. */
          username: username,
        },
      });

      accessToken = response.data.accessToken;
      if (!accessToken) {
        throw new Error('Access token was not found in response.');
      }
      localStorage.setItem('accessToken', accessToken);
    }
  } catch (e) {
    console.error(`ERROR Failed to get new access token.`);
    console.error(e);
    reduxStore.dispatch(logoutUser());
  }
  return accessToken;
};

// Set interceptor to attach access token to authorization header.
axiosFetch.interceptors.request.use(async (config) => {
  /** Need to be careful here, as it is very easy to accidentally cause an
   *  infinite loop since the refresh endpoint gets called inside of getApiToken.
   */
  if (config.url !== EndpointEnum.AUTH && config.url !== EndpointEnum.REFRESH) {
    const accessToken = await getApiToken();
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Set interceptor to catch errors.
axiosFetch.interceptors.response.use(undefined, (e) => {
  if (!(e instanceof AxiosError)) return Promise.reject(e);
  console.log('Error Response: ', e.response?.data);
  return Promise.reject(e);
});

export const changePasswordAsync = async (
  currentPass: string,
  newPass: string
) => {
  return axiosFetch({
    url: EndpointEnum.CHANGE_PASS,
    method: 'POST',
    data: {
      old_password: currentPass,
      new_password: newPass,
    },
  });
};

export const saveHealthFacilityAsync = async (facility: Facility) => {
  return axiosFetch({
    method: 'POST',
    url: EndpointEnum.HEALTH_FACILITIES,
    data: facility,
  });
};

export const getHealthFacilitiesAsync = async (): Promise<Facility[]> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.HEALTH_FACILITIES,
  });

  return response.data;
};

export const getHealthFacilityAsync = async (
  healthFacility?: string
): Promise<Facility> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.HEALTH_FACILITIES + `/${healthFacility}`,
  });
  return response.data;
};

export const handleArchiveFormTemplateAsync = async (template: FormTemplate) =>
  axiosFetch({
    method: 'PUT',
    url: EndpointEnum.FORM_TEMPLATES + '/' + template.id,
    data: template,
  });

export const saveFormTemplateWithFileAsync = async (file: File) => {
  // Axios will automatically serialize the object into proper form format.
  return axiosFetch.postForm(EndpointEnum.FORM_TEMPLATES, {
    file: file,
  });
};

export const submitFormTemplateAsync = async (
  form: FormTemplateWithQuestions
) => {
  return axiosFetch.postForm(EndpointEnum.FORM_TEMPLATES, form);
};

export const getFormClassificationTemplates = async (
  formClassificationId: string
) => {
  const response = await axiosFetch.get(
    `${EndpointEnum.FORM_CLASSIFICATIONS}/${formClassificationId}/templates`
  );
  return response.data;
};

export const getAllFormTemplatesAsync = async (includeArchived: boolean) => {
  const response = await axiosFetch.get(
    EndpointEnum.FORM_TEMPLATES + `?includeArchived=${includeArchived}`
  );
  return response.data;
};

export const getFormTemplateAsync = async (formTemplateId: string) => {
  const response = await axiosFetch.get(
    `${EndpointEnum.FORM_TEMPLATES}/${formTemplateId}`
  );
  return response.data;
};

export const getFormTemplateLangAsync = async (
  formTemplateId: string,
  lang: string
) =>
  (
    await axiosFetch.get(
      `${EndpointEnum.FORM_TEMPLATES}/${formTemplateId}?lang=${lang}`
    )
  ).data;

export const getFormTemplateLangsAsync = async (formTemplateId: string) =>
  (
    await axiosFetch.get(
      EndpointEnum.FORM_TEMPLATES + `/${formTemplateId}/versions`
    )
  ).data;

export const getFormTemplateCsvAsync = async (
  formTemplateId: string,
  version: string
) => {
  try {
    const response = await axiosFetch({
      url:
        EndpointEnum.FORM_TEMPLATES +
        `/${formTemplateId}/versions/${version}/csv`,
      responseType: 'blob',
    });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const uploadAppFileAsync = async (file: File) => {
  return axiosFetch.postForm(EndpointEnum.UPLOAD_ADMIN, {
    file: file,
  });
};

export const getAppFileAsync = async () => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.UPLOAD_ADMIN + '?' + Date.now(),
    responseType: 'blob',
  });
  return response.data;
};

export const getAppFileHeadAsync = async () => {
  const response = await axiosFetch({
    method: 'HEAD',
    url: EndpointEnum.UPLOAD_ADMIN + '?' + Date.now(),
    responseType: 'blob',
  });
  return response.data;
};

export const deleteUserAsync = async (user: User) => {
  const response = await axiosFetch({
    url: EndpointEnum.USER + String(user.id),
    method: 'DELETE',
  });
  return response.data;
};

export const createUserAsync = async (newUser: NewUser) => {
  const response = await axiosFetch({
    method: 'POST',
    url: EndpointEnum.USER_REGISTER,
    data: {
      ...newUser,
      supervises: newUser.role === UserRoleEnum.CHO ? newUser.supervises : [],
    },
  });
  return response.data;
};

export const editUserAsync = async (editUser: EditUser, userId: number) => {
  const response = await axiosFetch({
    method: 'PUT',
    url: EndpointEnum.USER + userId,
    data: {
      ...editUser,
      supervises: editUser.role === UserRoleEnum.CHO ? editUser.supervises : [],
    },
  });
  return response;
};

export const getUsersAsync = async (): Promise<User[]> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.USER_ALL,
  });
  const users = await response.data;
  /* Since much of the front-end was created with users only having a single 
  phone number, set the users 'phoneNumber' attribute to be the first 
  phone number in the 'phoneNumbers' array. */
  return users.map((user: User) => {
    user.phoneNumber = user.phoneNumbers.length > 0 ? user.phoneNumbers[0] : '';
    return user;
  });
};

export const resetUserPasswordAsync = async (user: User, password: string) => {
  return axiosFetch({
    method: 'POST',
    url: EndpointEnum.USER + String(user.id) + EndpointEnum.RESET_PASS,
    data: { password: password },
  });
};

export const saveAssessmentAsync = async (
  assessment: NewAssessment,
  assessmentId: string | undefined,
  patientId: string
) => {
  return axiosFetch({
    url:
      assessmentId !== undefined
        ? `${EndpointEnum.ASSESSMENTS}/${assessmentId}`
        : EndpointEnum.ASSESSMENTS,
    method: assessmentId !== undefined ? 'PUT' : 'POST',
    data: {
      patientId,
      ...assessment,
    },
  });
};

export const getAssessmentAsync = async (assessmentId: string) => {
  const resp = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.ASSESSMENTS + '/' + assessmentId,
  });
  return resp.data;
};

export const saveDrugHistoryAsync = async (
  drugHistory: string,
  patientId: string
) =>
  axiosFetch({
    url: EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.MEDICAL_RECORDS,
    method: 'POST',
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

export const saveReferralAssessmentAsync = async (referralId: string) =>
  axiosFetch({
    url: EndpointEnum.REFERRALS + `/assess/${referralId}`,
    method: 'PUT',
  });

export const saveFormResponseAsync = async (
  postBody: PostBody,
  formId?: string
) => {
  return axiosFetch({
    url: EndpointEnum.FORM + (formId ? '/' + formId : ''),
    method: formId ? 'PUT' : 'POST',
    data: formId
      ? {
          questions: postBody.edit,
        }
      : postBody.create,
  });
};

export const getFormResponseAsync = async (formId: string): Promise<CForm> => {
  const response = await axiosFetch.get(EndpointEnum.FORM + `/${formId}`);
  return response.data;
};

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

export const getPregnancyAsync = async (pregnancyId: string) => {
  const response = await axiosFetch.get(
    EndpointEnum.PREGNANCIES + `/${pregnancyId}`
  );
  return response.data;
};

export const deletePregnancyAsync = async (pregnancy: Pregnancy) =>
  axiosFetch({
    url: EndpointEnum.PREGNANCIES + `/${pregnancy.id}`,
    method: 'DELETE',
  });

export const deleteMedicalRecordAsync = async (medicalRecord: MedicalRecord) =>
  axiosFetch({
    url: EndpointEnum.MEDICAL_RECORDS + `/${medicalRecord.medicalRecordId}`,
    method: 'DELETE',
  });

export const getPatientMedicalRecordsAsync = async (patientId: string) => {
  const response = await axiosFetch.get(
    `/patients/${patientId}/medical_records`
  );
  const data = await response.data;
  return data.medical as MedicalRecord[];
};

export const getPatientDrugRecordsAsync = async (patientId: string) => {
  const response = await axiosFetch.get(
    `/patients/${patientId}/medical_records`
  );
  const data = await response.data;
  return data.drug as MedicalRecord[];
};

export const getMedicalRecordAsync = async (medicalRecordId: string) => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.MEDICAL_RECORDS + `/${medicalRecordId}`,
  });
  return response.data;
};
export const getPatientMedicalHistoryAsync = async (patientId: string) => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.MEDICAL_HISTORY,
  });
  return response.data;
};

/** Fetches the entries for the patient table of the patients page.
 *  Entries contain a subset of patient data joined with a subset of reading
 *  data.
 */
export const getPatientTableEntries = async () => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.PATIENTS,
  });
  return response.data;
};

export const getPatientsAdminAsync = async (includeArchived: boolean) => {
  const response = await axiosFetch({
    url:
      EndpointEnum.PATIENTS + '/admin' + `?includeArchived=${includeArchived}`,
  });
  return response.data;
};

export const archivePatientAsync = async (patientId: string) => {
  const response = await axiosFetch({
    method: 'PUT',
    url: EndpointEnum.PATIENTS + '/' + patientId + '/info',
    data: {
      isArchived: true,
    },
  });
  return response.data;
};

export const unarchivePatientAsync = async (patientId: string) => {
  const response = await axiosFetch({
    url: EndpointEnum.PATIENTS + '/' + patientId + '/info',
    method: 'PUT',
    data: {
      isArchived: false,
    },
  });
  return response.data;
};

export const getPatientAsync = async (patientId: string) => {
  try {
    const response = await axiosFetch({
      method: 'GET',
      url: EndpointEnum.PATIENTS + `/${patientId}`,
    });
    return response.data;
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
  const response = await axiosFetch.get(
    EndpointEnum.PATIENTS + `/${patientId}` + '/info'
  );
  return response.data;
};

export const getPatientPregnanciesAsync = async (patientId: string) => {
  const response = await axiosFetch.get(`/patients/${patientId}/pregnancies`);
  const data = await response.data;
  return data as Pregnancy[];
};

export const getPatientRecordsAsync = async (
  patientId: string,
  filterRequestBody: FilterRequestBody
) => {
  const response = await axiosFetch.get(
    `${EndpointEnum.PATIENTS}/${patientId}/get_all_records?readings=${
      filterRequestBody.readings ? 1 : 0
    }&referrals=${filterRequestBody.referrals ? 1 : 0}&assessments=${
      filterRequestBody.assessments ? 1 : 0
    }&forms=${filterRequestBody.forms ? 1 : 0}`
  );
  return response.data;
};

export const getPatientReferralsAsync = async (patientId: string) => {
  const response = await axiosFetch.get(
    EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.REFERRALS
  );

  return response.data;
};

export const getPatientStatisticsAsync = async (patientId: string) => {
  const response = await axiosFetch.get(
    EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.STATISTICS
  );

  return response.data;
};

export const getPatientPregnancySummaryAsync = async (patientId: string) => {
  const response = await axiosFetch.get(
    EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.PREGNANCY_SUMMARY
  );
  return response.data;
};

export const getPatientPregnancyInfoAsync = async (patientId: string) => {
  const response = await axiosFetch.get(
    EndpointEnum.PATIENTS + '/' + patientId + '/info'
  );
  return response.data;
};

export const saveReadingAsync = async (reading: any) => {
  const response = await axiosFetch({
    url: EndpointEnum.READINGS,
    method: 'POST',
    data: reading,
  });
  return response.data;
};

export const saveReferralAsync = async (referral: any) => {
  const response = await axiosFetch({
    url: EndpointEnum.REFERRALS,
    method: 'POST',
    data: referral,
  });
  return response.data;
};

export const getUserVhtsAsync = async (): Promise<Referrer[]> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.USER_VHTS,
  });
  return response.data;
};

export const getVHTsAsync = async (): Promise<VHT[]> => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.ALL_VHTS,
  });
  return response.data;
};

export const setReferralCancelStatusAsync = async (
  referralId: string,
  comment: string,
  isCancelled: boolean
) =>
  await axiosFetch({
    url: EndpointEnum.REFERRALS + '/cancel-status-switch/' + referralId,
    method: 'PUT',
    data: {
      cancelReason: comment,
      isCancelled,
    },
  });

export const setReferralNotAttendedAsync = async (
  referralId: string,
  comment: string
) =>
  await axiosFetch({
    url: EndpointEnum.REFERRALS + '/not-attend/' + referralId,
    method: 'PUT',
    data: {
      notAttendReason: comment,
    },
  });

export const getUserStatisticsExportAsync = async (
  user: string,
  from: number,
  to: number
) => {
  const response = await axiosFetch.get(
    EndpointEnum.STATS_USER_EXPORT + `/${user}?from=${from}&to=${to}`
  );
  return response.data;
};

export const getUserStatisticsAsync = async (
  user: string,
  from: number,
  to: number
) => {
  const response = await axiosFetch.get(
    EndpointEnum.STATS_USER + `/${user}?from=${from}&to=${to}`
  );
  return response.data;
};

export const getFacilityStatisticsAsync = async (
  facility: string,
  from: number,
  to: number
): Promise<IExportStatRow[]> => {
  const response = await axiosFetch.get(
    EndpointEnum.STATS_FACILITY + `/${facility}?from=${from}&to=${to}`
  );
  return response.data;
};

export const getAllStatisticsAsync = async (
  from: number,
  to: number
): Promise<IExportStatRow[]> => {
  const response = await axiosFetch.get(
    EndpointEnum.STATS_ALL + `?from=${from}&to=${to}`
  );
  return response.data;
};

export const getSecretKeyAsync = async (userId: number) => {
  const response = await axiosFetch({
    method: 'GET',
    url: `/user/${userId}` + EndpointEnum.SECRETKEY,
  });
  return response.data;
};

export const updateSecretKeyAsync = async (userId: number) => {
  const response = await axiosFetch({
    method: 'PUT',
    url: `/user/${userId}` + EndpointEnum.SECRETKEY,
  });
  return response.data;
};

export const addRelayServerPhone = async (
  phone: string,
  description: string
) => {
  const response = await axiosFetch({
    url: EndpointEnum.RELAY_SERVER_PHONE,
    method: MethodEnum.POST,
    data: {
      phone: phone,
      description: description,
    },
  });
  return response.data;
};

export const getRelayServerPhones = async () =>
  (await axiosFetch.get(EndpointEnum.RELAY_SERVER_PHONE)).data;

export const saveRelayNumAsync = async (relayNum: RelayNum) => {
  axiosFetch({
    url: EndpointEnum.RELAY_SERVER_PHONE,
    method: MethodEnum.PUT,
    data: relayNum,
  });
};

export const deleteRelayNumAsync = async (relayNum: RelayNum) => {
  axiosFetch({
    url: EndpointEnum.RELAY_SERVER_PHONE,
    method: MethodEnum.DELETE,
    data: relayNum,
  });
};
