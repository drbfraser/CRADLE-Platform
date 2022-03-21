import * as Yup from 'yup';

// field names here match POST /api/referrals
export enum ReferralField {
  comment = 'comment',
  healthFacility = 'referralHealthFacilityName',
}

export const initialState = {
  [ReferralField.comment]: '',
  [ReferralField.healthFacility]: null as string | null,
};

export type ReferralState = typeof initialState;

export const validationSchema = Yup.object().shape({
  [ReferralField.healthFacility]: Yup.string()
    .label('Health Facility')
    .required()
    .nullable(),
});
