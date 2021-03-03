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

export const validationSchema = Yup.object().shape({
  [FacilityField.about]: Yup.string(),
  [FacilityField.name]: Yup.string().label('Facility Name').max(50).required(),
  [FacilityField.phoneNumber]: Yup.string().max(50),
  [FacilityField.location]: Yup.string().max(50),
});
