// field names here match POST /api/referrals
export enum ReferralField {
  comment = 'comment',
  healthFacility = 'referralHealthFacilityName',
}

export const initialState = {
  [ReferralField.comment]: '',
  [ReferralField.healthFacility]: '',
};

export type ReferralState = typeof initialState;
