import { makePhoneNumberValidationSchema } from 'src/shared/components/Form/PhoneNumberField';
import * as Yup from 'yup';

export enum FacilityField {
  about = 'about',
  type = 'type',
  name = 'name',
  phoneNumber = 'phoneNumber',
  location = 'location',
  newReferrals = 'newReferrals',
  index = 'index',
}

export const makeFacilityValidationSchema = (
  existingNames: string[],
  otherFacilityPhoneNumbers: string[]
) => {
  return Yup.object().shape({
    about: Yup.string(),
    type: Yup.string().label('Facility Type').required(),
    name: Yup.string()
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
    phoneNumber: makePhoneNumberValidationSchema(otherFacilityPhoneNumbers),
    location: Yup.string().max(50),
  });
};

export const facilityTemplate = {
  about: '',
  type: '',
  name: '',
  phoneNumber: '',
  location: '',
  newReferrals: 0,
  index: 0,
};

export const facilityTypes = ['HCF_2', 'HCF_3', 'HCF_4', 'HOSPITAL'];
