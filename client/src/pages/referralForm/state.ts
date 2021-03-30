import * as Yup from 'yup';

// field names here match POST /api/referrals
export enum ReferralField {
  comment = 'comment',
  healthFacility = 'referralHealthFacilityName',
}

export const initialState = {
  [ReferralField.comment]: '',
  [ReferralField.healthFacility]: null,
};

export const validationSchema = Yup.object().shape({
  [ReferralField.healthFacility]: Yup.string()
    .label('Health Facility')
    .required()
    .nullable(),
});

export type ReferralState = typeof initialState;
