import { axiosFetch } from '../core/http';
import { EndpointEnum, TrafficLightEnum } from 'src/shared/enums';
import { ReferralFilter } from 'src/shared/types/referralTypes';
//import { ReferralFilter } from 'src/shared/referralTypes';
export const saveReferralAssessmentAsync = async (referralId: string) =>
  axiosFetch({
    url: EndpointEnum.REFERRALS + `/assess/${referralId}`,
    method: 'PUT',
  });

export const saveReferralAsync = async (referral: any) => {
  const response = await axiosFetch({
    url: EndpointEnum.REFERRALS,
    method: 'POST',
    data: referral,
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
//get all referrals
export const getReferralsAsync = async (paramaters?: {
  search?: string;
  filter?: ReferralFilter;
}) => {
  console.log(paramaters);
  console.log(paramaters?.filter);
  const params = {
    search: paramaters?.search,
    health_facilities: paramaters?.filter?.healthFacilityNames,
    date_range: paramaters?.filter?.dateRange,
    referrers: paramaters?.filter?.referrers,
    vital_signs: paramaters?.filter?.vitalSigns,
    is_assessed: paramaters?.filter?.isAssessed,
    is_pregnant: paramaters?.filter?.isPregnant
  };
  console.log(params);
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.REFERRALS,
    paramsSerializer: {
      indexes: null
    },
    params, // pass search and filter to backend
  });
  return response.data;
};
