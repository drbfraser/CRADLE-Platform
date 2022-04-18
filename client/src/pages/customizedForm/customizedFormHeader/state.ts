import * as Yup from 'yup';
// field names here match POST /api/referrals
export enum CustomizedFormField {
  lang = 'lang',
  name = 'name',
}

export const initialState = {
  [CustomizedFormField.lang]: null as string | null,
  [CustomizedFormField.name]: null as string | null,
};

export type CustomizedFormState = typeof initialState;

export const validationSchema = Yup.object().shape({
  [CustomizedFormField.lang]: Yup.string()
    .label('Language')
    .required()
    .nullable(),
  [CustomizedFormField.name]: Yup.string()
  .label('Name')
  .required()
  .nullable(),
});
