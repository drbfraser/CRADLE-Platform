import * as Yup from 'yup';

// field names here match POST /api/referrals
export enum ReferralField {
  comment = 'comment',
  healthFacility = 'healthFacilityName',
}

export const initialState = {};

export type ReferralState = typeof initialState;

export const validationSchema = Yup.object().shape({});
