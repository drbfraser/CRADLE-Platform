// import * as Yup from 'yup';

// field names here match POST /api/referrals
export enum SingleReasonField {
  comment = 'comment',
  //healthFacility = 'referralHealthFacilityName',
}

export const initialState = {
  [SingleReasonField.comment]: '',
  //[ReferralField.healthFacility]: null as string | null,
};

export type SingleReason = typeof initialState;

// export const validationSchema = Yup.object().shape({
//   [ReferralField.healthFacility]: Yup.string()
//     .label('Health Facility')
//     .required()
//     .nullable(),
// });
