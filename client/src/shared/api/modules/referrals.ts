import { axiosFetch } from '../core/http';
import { EndpointEnum } from 'src/shared/enums';
import { ReferralFilter } from 'src/shared/types/referralTypes';
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
export const getReferralsAsync = async (params?: {
  search?: string;
  filter?: ReferralFilter;
}) => {
  const response = await axiosFetch({
    method: 'GET',
    url: EndpointEnum.REFERRALS,
    params, // pass search and filter to backend
  });
  return response.data;
};
