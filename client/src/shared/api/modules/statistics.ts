import { axiosFetch } from '../core/http';
import { EndpointEnum } from 'src/shared/enums';
import { StatsData, validateStatsData } from '../validation/statistics';

export const getFacilityStatisticsAsync = async (
  facility: string,
  from: number,
  to: number
): Promise<StatsData> => {
  try {
    const response = await axiosFetch.get(
      EndpointEnum.STATS_FACILITY + `/${facility}?from=${from}&to=${to}`
    );
    return validateStatsData(response.data);
  } catch (e) {
    console.error(`Error querying for facility (${facility}) statistics: ${e}`);
    throw e;
  }
};

export const getUserStatisticsAsync = async (
  user: string,
  from: number,
  to: number
): Promise<StatsData> => {
  try {
    const response = await axiosFetch.get(
      EndpointEnum.STATS_USER + `/${user}?from=${from}&to=${to}`
    );
    return validateStatsData(response.data);
  } catch (e) {
    console.error(`Error querying for user statistics: ${e}`);
    throw e;
  }
};

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

export const getAllStatisticsAsync = async (
  from: number,
  to: number
): Promise<StatsData> => {
  try {
    const response = await axiosFetch.get(
      EndpointEnum.STATS_ALL + `?from=${from}&to=${to}`
    );
    return validateStatsData(response.data);
  } catch (e) {
    console.error(`Error querying for all statistics: ${e}`);
    throw e;
  }
};
