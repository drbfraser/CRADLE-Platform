import * as Yup from 'yup';
// field names here match POST /api/referrals
export enum CustomizedFormField {
  form_template_id = 'form_template_id',
  lang = 'lang',
}

export const initialState = {
  [CustomizedFormField.form_template_id]: null as string | null,
  [CustomizedFormField.lang]: null as string | null,
};

export type CustomizedFormState = typeof initialState;

export const validationSchema = Yup.object().shape({
  [CustomizedFormField.form_template_id]: Yup.string().label('Form').required().nullable(),
  [CustomizedFormField.lang]: Yup.string().label('Language').required().nullable()
});
