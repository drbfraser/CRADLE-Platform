import * as Yup from 'yup';

export interface IUserGet {
  id: number;
  email: string;
  firstName: string;
  healthFacilityName: string;
  roleIds: number[];
  vhtList: number[];
}

export interface IUserRegister {
  email: string;
  password: string;
  firstName: string;
  healthFacilityName: string;
  role: string;
}

export interface IUserEdit {
  email: string;
  firstName: string;
  healthFacilityName: string;
  newRoleIds: number[];
  newVhtIds: number[];
}

export interface IVHT {
  id: number;
  email: string;
}

export enum FacilityField {
  about = 'about',
  type = 'healthFacilityType',
  name = 'healthFacilityName',
  phoneNumber = 'healthFacilityPhoneNumber',
  location = 'location',
}

export const getValidationSchema = (existingNames: string[]) => {
  return Yup.object().shape({
    [FacilityField.about]: Yup.string(),
    [FacilityField.name]: Yup.string()
      .label('Facility Name')
      .max(50)
      .required()
      .test(
        'existing-name',
        'You may not create a facility with the same name as an existing one.',
        (value) => {
          const format = (value: any) => String(value).toLowerCase().trim();
          return !existingNames.map((n) => format(n)).includes(format(value));
        }
      ),
    [FacilityField.phoneNumber]: Yup.string().max(50),
    [FacilityField.location]: Yup.string().max(50),
  });
};
