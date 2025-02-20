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
  Referral,
  PatientMedicalInfo,
  PatientPregnancyInfo,
  PatientStatistics,
  Patient,
} from '../types';
import { EndpointEnum, MethodEnum, UserRoleEnum } from '../enums';
import axios, { AxiosError } from 'axios';
import { PostBody } from 'src/pages/customizedForm/customizedEditForm/handlers';
import { reduxStore } from 'src/redux/store';
import { showMessage } from 'src/redux/actions/messageActions';
import { EditUser, NewUser, User, userListSchema } from './validation/user';
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

  if (accessToken === null) {
    throw new Error('No access token found!');
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
  console.error('Error Response: ', e.response?.data);
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

export const saveFormTemplateAsync = async (
  formTemplate: FormTemplateWithQuestions
) => {
  // Sends FormTemplate to server via request body rather than as a file.
  return axiosFetch({
    method: 'POST',
    url: `${EndpointEnum.FORM_TEMPLATES}/body`,
    data: formTemplate,
  });
};

export const getFormClassificationTemplates = async (
  formClassificationId: string
) => {
  const response = await axiosFetch.get(
    `${EndpointEnum.FORM_CLASSIFICATIONS}/${formClassificationId}/templates`
  );
  return response.data;
};

export const getAllFormTemplatesAsync = async (
  includeArchived: boolean
): Promise<FormTemplate[]> => {
  try {
    const response = await axiosFetch.get(
      EndpointEnum.FORM_TEMPLATES + `?includeArchived=${includeArchived}`
    );
    return response.data;
  } catch (e) {
    console.error(`Error getting all from templates: ${e}`);
    throw e;
  }
};

export const getFormTemplateAsync = async (formTemplateId: string) => {
  const response = await axiosFetch.get(
    `${EndpointEnum.FORM_TEMPLATES}/blank/${formTemplateId}`
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
  const data = await response.data;

  return new Promise((resolve, reject) => {
    const result = userListSchema.safeParse(data);
    if (result.success) {
      return resolve(result.data);
    } else {
      console.error(result.error);
      return reject(result.error);
    }
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
    url: EndpointEnum.MEDICAL_RECORDS + `/${medicalRecord.id}`,
    method: 'DELETE',
  });

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

export const getMedicalRecordAsync = async (medicalRecordId: string) => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.MEDICAL_RECORDS + `/${medicalRecordId}`,
  });
  return response.data;
};
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

export const getPatientRecordsAsync = async (
  patientId: string,
  filterRequestBody: FilterRequestBody
) => {
  try {
    const response = await axiosFetch.get(
      `${EndpointEnum.PATIENTS}/${patientId}/get_all_records?readings=${
        filterRequestBody.readings ? 1 : 0
      }&referrals=${filterRequestBody.referrals ? 1 : 0}&assessments=${
        filterRequestBody.assessments ? 1 : 0
      }&forms=${filterRequestBody.forms ? 1 : 0}`
    );
    return response.data;
  } catch (e) {
    console.error(`Error loading patient records: ${e}`);
    throw e;
  }
};

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
