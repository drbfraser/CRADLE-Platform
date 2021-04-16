import { apiFetch } from 'src/shared/utils/api';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';

export type Response = {
  patients_referred: number;
  sent_referrals: number;
  days_with_readings: number;
  unique_patient_readings: number;
  total_readings: number;
  color_readings: ColorReading;
};

export type Data = {
  patients_referred: number;
  sent_referrals: number;
  days_with_readings: number;
  unique_patient_readings: number;
  total_readings: number;
};

export type ColorReading = {
  color_readings: TrafficLight;
};

export type TrafficLight = {
  GREEN: number;
  YELLOW_UP: number;
  YELLOW_DOWN: number;
  RED_UP: number;
  RED_DOWN: number;
};

export const initialData: Data = {
  patients_referred: 0,
  sent_referrals: 0,
  days_with_readings: 0,
  unique_patient_readings: 0,
  total_readings: 0,
};

export const initialColorReading: ColorReading = {
  color_readings: {
    GREEN: 0,
    YELLOW_UP: 0,
    YELLOW_DOWN: 0,
    RED_UP: 0,
    RED_DOWN: 0,
  },
};

export interface IStatistic {
  referral_date: number;
  parsed_date: string;
  parsed_time: string;
  parsed_pregnant: string;
  patientId: string;
  name: string;
  sex: string;
  age: number;
  pregnant: boolean;
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate: number;
  traffic_color: string;
  traffic_arrow: string;
}

export const apiFetchSafe = async (url: string) => {
  try {
    const res = await apiFetch(url);

    if (!res.ok) {
      throw new Error(`Fetch from: ${url} failed with status: ${res.status}`);
    }
    return res.json();
  } catch (err) {
    throw new Error(err);
  }
};

export const getAllUsers = async () =>
  apiFetchSafe(BASE_URL + EndpointEnum.USER_ALL);

export const getAllVHT = async () =>
  apiFetchSafe(BASE_URL + EndpointEnum.ALL_VHTS);

export const getAllFacilities = async () =>
  apiFetchSafe(BASE_URL + EndpointEnum.HEALTH_FACILITIES);

export const getAllUserAndFacilitiesData = async (from: number, to: number) =>
  apiFetchSafe(BASE_URL + EndpointEnum.STATS_ALL + `?from=${from}&to=${to}`);

export const getAllVHTInformationData = async () =>
  apiFetchSafe(BASE_URL + EndpointEnum.ALL_VHTS);

export const getUserStatisticData = async (
  userId: number | undefined,
  from: number,
  to: number
) =>
  apiFetchSafe(
    BASE_URL + EndpointEnum.STATS_USER + `/${userId}?from=${from}&to=${to}`
  );

export const getFacilitiesData = async (
  healthFacilityName: string | undefined,
  from: number,
  to: number
) =>
  apiFetchSafe(
    BASE_URL +
      EndpointEnum.STATS_FACILITY +
      `/${healthFacilityName}?from=${from}&to=${to}`
  );

export const getUserExportData = async (
  userId: number | undefined,
  from: number,
  to: number
) =>
  apiFetchSafe(
    BASE_URL +
      EndpointEnum.STATS_USER_EXPORT +
      `/${userId}?from=${from}&to=${to}`
  );
