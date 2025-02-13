import * as Yup from 'yup';

// values must match API fields
export enum PasswordField {
  currentPass = 'old_password',
  newPass = 'new_password',
  confirmNewPass = 'confirm_new_password',
}

export interface IPasswordForm {
  [PasswordField.currentPass]: string;
  [PasswordField.newPass]: string;
  [PasswordField.confirmNewPass]: string;
}

export const initialValues = {
  [PasswordField.currentPass]: '',
  [PasswordField.newPass]: '',
  [PasswordField.confirmNewPass]: '',
};

export const validationSchema = Yup.object().shape({
  [PasswordField.currentPass]: Yup.string()
    .label('Current Password')
    .required(),
  [PasswordField.newPass]: Yup.string().label('New Password').required().min(8),
  [PasswordField.confirmNewPass]: Yup.string().oneOf(
    [Yup.ref(PasswordField.newPass)],
    'Passwords must match'
  ),
});
