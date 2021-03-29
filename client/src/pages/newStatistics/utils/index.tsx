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

export const getAllVHTInformationData = async () => {
  const url = BASE_URL + EndpointEnum.ALL_VHTS;
  try {
    const res = await apiFetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(
        'Getting All VHT Information Response failed with error code: ' +
          res.status
      );
    }
    return res.json();
  } catch (err) {
    throw new Error(err);
  }
};

export const getUserStatisticData = async (
  userId: number | undefined,
  from: number,
  to: number
) => {
  const url =
    BASE_URL + EndpointEnum.STATS_USER + `/${userId}?from=${from}&to=${to}`;
  try {
    const res = await apiFetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(
        'Getting Statistic Data Response failed with error code: ' + res.status
      );
    }
    return res.json();
  } catch (err) {
    throw new Error(err);
  }
};

export const getFacilitiesData = async (
  healthFacilityName: string | undefined,
  from: number,
  to: number
) => {
  const url =
    BASE_URL +
    EndpointEnum.STATS_FACILITY +
    `/${healthFacilityName}?from=${from}&to=${to}`;
  try {
    const res = await apiFetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(
        'Getting Facility Data Response failed with error code: ' + res.status
      );
    }
    return res.json();
  } catch (err) {
    throw new Error(err);
  }
};

export const getAllUserAndFacilitiesData = async (from: number, to: number) => {
  const url = BASE_URL + EndpointEnum.STATS_ALL + `?from=${from}&to=${to}`;
  try {
    const res = await apiFetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(
        'Getting Facility Data Response failed with error code: ' + res.status
      );
    }
    return res.json();
  } catch (err) {
    throw new Error(err);
  }
};

export const getAllVHT = async () => {
  const url = BASE_URL + EndpointEnum.ALL_VHTS;
  try {
    const res = await apiFetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(
        'Getting All VHTs Data Response failed with error code: ' + res.status
      );
    }
    return res.json();
  } catch (err) {
    throw new Error(err);
  }
};

export const getAllUsers = async () => {
  const url = BASE_URL + EndpointEnum.USER_ALL;
  try {
    const res = await apiFetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(
        'Getting All Users Response failed with error code: ' + res.status
      );
    }
    return res.json();
  } catch (err) {
    throw new Error(err);
  }
};

export const getAllFacilities = async () => {
  const url = BASE_URL + EndpointEnum.FACILITIES_ALL;
  try {
    const res = await apiFetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(
        'Getting All Users Response failed with error code: ' + res.status
      );
    }
    return res.json();
  } catch (err) {
    throw new Error(err);
  }
};
