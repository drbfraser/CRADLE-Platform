import * as Yup from 'yup';

export enum FacilityField {
  about = 'about',
  type = 'facilityType',
  name = 'healthFacilityName',
  phoneNumber = 'healthFacilityPhoneNumber',
  location = 'location',
  newReferrals = 'newReferrals',
}

export const getValidationSchema = (existingNames: string[]) => {
  return Yup.object().shape({
    [FacilityField.about]: Yup.string(),
    [FacilityField.type]: Yup.string(),
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
  [FacilityField.type]: '',
  [FacilityField.name]: '',
  [FacilityField.phoneNumber]: '',
  [FacilityField.location]: '',
  [FacilityField.newReferrals]: 0,
};

export const facilityTypes = ['HCF_2', 'HCF_3', 'HCF_4', 'HOSPITAL'];
