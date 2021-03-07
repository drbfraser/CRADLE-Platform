import * as Yup from 'yup';

export enum FacilityField {
  about = 'about',
  type = 'healthFacilityType',
  name = 'healthFacilityName',
  phoneNumber = 'healthFacilityPhoneNumber',
  location = 'location',
}

export interface IFacility {
  [FacilityField.about]: string;
  [FacilityField.type]: string;
  [FacilityField.name]: string;
  [FacilityField.phoneNumber]: string;
  [FacilityField.location]: string;
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

export const facilityTemplate = {
  [FacilityField.about]: '',
  [FacilityField.name]: '',
  [FacilityField.phoneNumber]: '',
  [FacilityField.location]: '',
};
