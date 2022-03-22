import * as Yup from 'yup'; 
// field names here match POST /api/referrals
export enum ReferralField {
  form = 'Form',
  lang = 'Language',
}

export const initialState = {
  [ReferralField.lang]: null as string | null,
  [ReferralField.form]: null as string | null,
};

export type ReferralState = typeof initialState;

export const validationSchema = Yup.object().shape({
  [ReferralField.form]: Yup.string()
    .label('Form')
    .required()
    .nullable(),
});
