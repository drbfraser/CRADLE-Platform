import * as Yup from 'yup';

import { IUser } from 'src/shared/types';
import { UserRoleEnum } from 'src/shared/enums';

export enum UserField {
  firstName = 'firstName',
  email = 'email',
  healthFacilityName = 'healthFacilityName',
  role = 'role',
  supervises = 'supervises',
  password = 'password',
  confirmPassword = 'confirmPassword',
  id = 'userId',
}

export const fieldLabels = {
  [UserField.firstName]: 'First Name',
  [UserField.email]: 'Email',
  [UserField.healthFacilityName]: 'Health Facility',
  [UserField.role]: 'Role',
  [UserField.supervises]: 'VHTs Supervised',
  [UserField.password]: 'Password',
  [UserField.confirmPassword]: 'Confirm Password',
};

const detailsValidationShape = (emailsInUse: string[]) => ({
  [UserField.firstName]: Yup.string()
    .label(fieldLabels[UserField.firstName])
    .required(),
  [UserField.email]: Yup.string()
    .label(fieldLabels[UserField.email])
    .required()
    .email('Please enter a valid email address')
    .notOneOf(emailsInUse, 'This email address is already in use'),
  [UserField.healthFacilityName]: Yup.string()
    .label(fieldLabels[UserField.healthFacilityName])
    .required()
    .nullable(),
  [UserField.role]: Yup.string().label(fieldLabels[UserField.role]).required(),
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

export const newEditValidationSchema = (
  creatingNew: boolean,
  emailsInUse: string[]
) => {
  let shape = detailsValidationShape(emailsInUse);

  if (creatingNew) {
    shape = {
      ...shape,
      ...passwordValidationShape,
    };
  }

  return Yup.object().shape(shape);
};

export const passwordValidationSchema = Yup.object().shape(
  passwordValidationShape
);

export const newUserTemplate: IUser = {
  [UserField.firstName]: '',
  [UserField.email]: '',
  [UserField.healthFacilityName]: '',
  [UserField.role]: UserRoleEnum.VHT,
  [UserField.supervises]: [] as number[],
  [UserField.id]: 0,
};

export const resetPasswordTemplate = {
  [UserField.password]: '',
  [UserField.confirmPassword]: '',
};
