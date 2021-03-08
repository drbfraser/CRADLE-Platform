import * as Yup from 'yup';

// values must match API fields
export enum PasswordField {
  currentPass = 'old_password',
  newPass = 'new_password',
}

export interface IPasswordForm {
  [PasswordField.currentPass]: string;
  [PasswordField.newPass]: string;
}

export const initialValues = {
  [PasswordField.currentPass]: '',
  [PasswordField.newPass]: '',
};

export const validationSchema = Yup.object().shape({
  [PasswordField.currentPass]: Yup.string()
    .label('Current Password')
    .required(),
  [PasswordField.newPass]: Yup.string().label('New Password').required().min(8),
});
