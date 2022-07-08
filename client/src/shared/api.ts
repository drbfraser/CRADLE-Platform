import {
  AssessmentField,
  AssessmentState,
} from 'src/pages/assessmentForm/state';
import {
  CForm,
  FilterRequestBody,
  FormTemplate,
  IUser,
  IUserWithIndex,
  MedicalRecord,
  NewAssessment,
  PatientMedicalInfo,
  PatientPregnancyInfo,
  PatientStatistics,
  Pregnancy,
} from './types';
import { EndpointEnum, MethodEnum, UserRoleEnum } from './enums';

import { IFacility } from 'src/pages/admin/manageFacilities/state';
import { PasswordField } from 'src/app/topBar/changePassword/state';
import { UserField } from 'src/pages/admin/manageUsers/state';
import jwt_decode from 'jwt-decode';
import { logoutUser } from 'src/redux/reducers/user/currentUser';
import { post_body } from 'src/pages/customizedForm/customizedEditForm/handlers';
import { reduxStore } from 'src/redux/store';

export const API_URL =
  process.env.NODE_ENV === `development`
    ? `http://${window.location.hostname}:5000/api`
    : '/api';

export const getApiToken = async () => {
  let token = localStorage.getItem(`token`);

  try {
    const decodedToken = token ? jwt_decode<{ exp: number }>(token) : null;
    const currentTime = new Date().getTime() / 1000;

    const shouldRefreshToken =
      !decodedToken || currentTime > decodedToken.exp + 30;

    if (shouldRefreshToken) {
      const refreshToken = localStorage.refresh;

      if (!refreshToken) {
        throw new Error();
      }

      const init = {
        method: MethodEnum.POST,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      };

      const resp = await fetch(`${API_URL}${EndpointEnum.REFRESH}`, init);

      if (!resp.ok) {
        throw new Error();
      }

      token = (await resp.json()).data.token;
      localStorage.setItem('token', token!);
    }
  } catch (e) {
    reduxStore.dispatch(logoutUser());
  }

  return token;
};

export const apiFetch = async (
  input: RequestInfo,
  init?: RequestInit | undefined,
  isFormData?: boolean,
  needErrorInfo?: boolean
): Promise<Response> => {
  const token = await getApiToken();
  const contentType = isFormData
    ? undefined
    : {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

  return fetch(input, {
    ...init,
    headers: {
      ...contentType,
      Authorization: `Bearer ${token}`,
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
  const init = {
    method: 'POST',
    body: JSON.stringify({
      [PasswordField.currentPass]: currentPass,
      [PasswordField.newPass]: newPass,
    }),
  };

  return apiFetch(API_URL + EndpointEnum.CHANGE_PASS, init);
};

export const createHealthFacilityAsync = async (facility: IFacility) =>
  apiFetch(API_URL + EndpointEnum.HEALTH_FACILITIES, {
    method: 'POST',
    body: JSON.stringify(facility),
  });

export const getFacilitiesAsync = async (): Promise<IFacility[]> =>
  (await apiFetch(API_URL + EndpointEnum.HEALTH_FACILITIES)).json();

export const archiveFormTemplateAsync = async (template: FormTemplate) =>
  apiFetch(
    API_URL + EndpointEnum.FORM_TEMPLATES + '/' + template.id,
    {
      method: 'PUT',
      body: JSON.stringify(template),
    },
    false
  );

export const createFormTemplateWithFileAsync = async (file: File) => {
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

export const getFormTemplatesAsync = async (): Promise<FormTemplate[]> =>
  (await apiFetch(API_URL + EndpointEnum.FORM_TEMPLATES)).json();

export const getFormTemplateLangAsync = async (
  formTemplateId: string,
  lang: string
) =>
  (
    await apiFetch(
      API_URL + EndpointEnum.FORM_TEMPLATE + `/${formTemplateId}?lang=${lang}`
    )
  ).json();

export const getFormTemplateLangsAsync = async (formTemplateId: string) =>
  (
    await apiFetch(
      API_URL + EndpointEnum.FORM_TEMPLATE + `/${formTemplateId}/versions`
    )
  ).json();

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

export const deleteUserAsync = async (user: IUser) =>
  apiFetch(API_URL + EndpointEnum.USER + String(user.userId), {
    method: 'DELETE',
  });

export const saveUserAsync = async (
  user: IUser,
  userId: number | undefined
) => {
  const url =
    API_URL +
    (userId ? EndpointEnum.USER + userId : EndpointEnum.USER_REGISTER);

  const init = {
    method: userId ? 'PUT' : 'POST',
    body: JSON.stringify({
      ...user,
      supervises: user.role === UserRoleEnum.CHO ? user.supervises : [],
    }),
  };

  return apiFetch(url, init);
};

export const getUsersAsync = async (): Promise<IUserWithIndex[]> =>
  (await apiFetch(API_URL + EndpointEnum.USER_ALL)).json();

export const resetUserPasswordAsync = async (user: IUser, password: string) => {
  const url =
    API_URL + EndpointEnum.USER + String(user.userId) + EndpointEnum.RESET_PASS;

  const init = {
    method: 'POST',
    body: JSON.stringify({
      [UserField.password]: password,
    }),
  };

  return apiFetch(url, init);
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
  const resp = await apiFetch(
    API_URL + EndpointEnum.ASSESSMENTS + '/' + assessmentId
  );

  return resp.json();
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
  apiFetch(API_URL + EndpointEnum.REFERRALS_ASSESS + `/${referralId}`, {
    method: 'PUT',
  });

export const saveFormResponseAsync = async (
  postBody: post_body,
  formId?: string
) => {
  const url = API_URL + EndpointEnum.FORM + (formId ? formId : '');

  const init = {
    method: formId ? 'PUT' : 'POST',
    body: JSON.stringify(
      formId ? { questions: postBody.edit } : postBody.creat
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

export const getMedicalRecordAsync = async (medicalRecordId: string) =>
  apiFetch(API_URL + EndpointEnum.MEDICAL_RECORDS + `/${medicalRecordId}`);

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

export const getPatientAsync = async (patientId: string) => {
  const response = await apiFetch(
    API_URL + EndpointEnum.PATIENTS + `/${patientId}`
  );

  return response.json();
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
