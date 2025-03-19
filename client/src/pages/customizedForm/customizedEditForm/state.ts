import * as Yup from 'yup';

// field names here match POST /api/referrals
export enum ReferralField {
  comment = 'comment',
  healthFacility = 'healthFacilityName',
}

export const initialState = {
  [ReferralField.comment]: '',
  [ReferralField.healthFacility]: '',
  numberField: {
    value: null,  // Initial value of the number field
    min: 0,       // Default minimum value
    max: 100,     // Default maximum value
    required: true, // Whether the field is required
    units: 'kg',  // Default unit
  },
};


export type ReferralState = typeof initialState;

export const validationSchema = Yup.object().shape({
  [ReferralField.comment]: Yup.string().optional(),
  [ReferralField.healthFacility]: Yup.string().required('Required'),
  numberField: Yup.object().shape({
    value: Yup.number()
      .min(Yup.ref('min'), ({ min }) => `Value must be at least ${min}`)
      .max(Yup.ref('max'), ({ max }) => `Value must not exceed ${max}`)
      .required('This field is required'),
    min: Yup.number().default(0),  // Default minimum value
    max: Yup.number().default(100), // Default maximum value
    required: Yup.boolean().default(true),
    units: Yup.string().default('kg'), // Default unit
  }),
});
