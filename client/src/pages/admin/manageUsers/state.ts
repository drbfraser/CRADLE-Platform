import * as Yup from 'yup';

export enum UserField {
  name = 'name',
  email = 'email',
  phoneNumber = 'phoneNumber',
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
  [UserField.phoneNumber]: 'Phone Number',
  [UserField.healthFacilityName]: 'Health Facility',
  [UserField.role]: 'Role',
  [UserField.supervises]: 'VHTs Supervised',
  [UserField.password]: 'Password',
  [UserField.confirmPassword]: 'Confirm Password',
};

const detailsValidationShape = (emailsInUse: string[]) => ({
  [UserField.name]: Yup.string().label(fieldLabels[UserField.name]).required(),
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

export const newEditValidationSchema = (emailsInUse: string[]) => {
  const shape = detailsValidationShape(emailsInUse);

  return Yup.object().shape(shape);
};

export const passwordValidationSchema = Yup.object().shape(
  passwordValidationShape
);

export const resetPasswordTemplate = {
  [UserField.password]: '',
  [UserField.confirmPassword]: '',
};
