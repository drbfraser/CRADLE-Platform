import * as Yup from 'yup';
import { makePhoneNumberValidationSchema } from 'src/shared/components/Form/PhoneNumberField';

export enum UserField {
  name = 'name',
  email = 'email',
  phoneNumbers = 'phoneNumbers',
  healthFacilityName = 'healthFacilityName',
  role = 'role',
  supervises = 'supervises',
  password = 'password',
  confirmPassword = 'confirmPassword',
  id = 'id',
}

export const fieldLabels = {
  [UserField.name]: 'Name',
  [UserField.email]: 'Email',
  [UserField.phoneNumbers]: 'Phone Numbers',
  [UserField.healthFacilityName]: 'Health Facility',
  [UserField.role]: 'Role',
  [UserField.supervises]: 'VHTs Supervised',
  [UserField.password]: 'Password',
  [UserField.confirmPassword]: 'Confirm Password',
};

const userValidationShape = (
  otherUsersEmails: string[],
  otherUsersPhoneNumbers: string[]
) => ({
  [UserField.name]: Yup.string().label(fieldLabels[UserField.name]).required(),
  [UserField.email]: Yup.string()
    .label(fieldLabels[UserField.email])
    .required()
    .email('Please enter a valid email address')
    .notOneOf(otherUsersEmails, 'This email address is already in use'),
  [UserField.healthFacilityName]: Yup.string()
    .label(fieldLabels[UserField.healthFacilityName])
    .required()
    .nullable(),
  [UserField.role]: Yup.string().label(fieldLabels[UserField.role]).required(),
  [UserField.phoneNumbers]: Yup.array().of(
    makePhoneNumberValidationSchema(otherUsersPhoneNumbers)
  ),
});

const passwordValidationShape = {
  [UserField.password]: Yup.string()
    .label(fieldLabels[UserField.password])
    .required()
    .min(8),
  [UserField.confirmPassword]: Yup.string()
    .label(fieldLabels[UserField.confirmPassword])
    .required()
    .oneOf([Yup.ref(UserField.password)], 'Passwords must match'),
};

export const makeEditUserValidationSchema = (
  otherUsersEmails: string[],
  otherUsersPhoneNumbers: string[]
) => {
  const shape = userValidationShape(otherUsersEmails, otherUsersPhoneNumbers);
  return Yup.object().shape(shape);
};

export const passwordValidationSchema = Yup.object().shape(
  passwordValidationShape
);

export const resetPasswordTemplate = {
  [UserField.password]: '',
  [UserField.confirmPassword]: '',
};

export const makeNewUserValidationSchema = (
  otherUsersEmails: string[],
  otherUsersPhoneNumbers: string[]
) => {
  const shape = userValidationShape(otherUsersEmails, otherUsersPhoneNumbers);
  return Yup.object().shape({
    ...shape,
    ...passwordValidationShape,
  });
};
