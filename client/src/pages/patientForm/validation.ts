import * as Yup from 'yup';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { getAgeBasedOnDOB } from 'src/shared/utils';
import { PatientField } from './state';

const ageIsValid = (age: number): boolean => {
  return age >= 15 && age <= 65;
};

export const patientValidationSchema = (creatingNew: boolean) =>
  Yup.object().shape({
    // no validation if patient ID field is disabled when editing existing patient
    [PatientField.patientId]: !creatingNew
      ? Yup.string()
      : Yup.number()
          .typeError('A valid patient ID is required.')
          .integer('A valid patient ID is required.')
          .test(
            'length',
            'A valid patient ID is required.',
            (pId) => String(pId).length > 0 && String(pId).length <= 15
          ),
    // For writing + testing Regex, see: regex101.com
    [PatientField.patientName]: Yup.string()
      .label('Name')
      .matches(/^\w[\w.'\- ]*$/, 'Name is not valid.')
      .required(),
    [PatientField.isExactDob]: Yup.boolean(),
    [PatientField.dob]: Yup.date().when(PatientField.isExactDob, {
      is: true,
      then: Yup.date().test(
        'valid-dob',
        'Please enter a valid date of birth corresponding to an age between 15 - 65.',
        (date) => ageIsValid(getAgeBasedOnDOB(date))
      ),
    }),
    [PatientField.estimatedAge]: Yup.number().when(PatientField.isExactDob, {
      is: false,
      then: Yup.number()
        .integer('Please enter a valid age between 15 - 65.')
        .test('valid-age', 'Please enter a valid age between 15 - 65.', (age) =>
          ageIsValid(age)
        ),
    }),
    [PatientField.villageNumber]: Yup.number()
      .typeError('Village number must be numeric')
      .integer('Village number must be numeric')
      .min(1, 'Village number must be numeric'),
    [PatientField.isPregnant]: Yup.boolean(),
    [PatientField.gestationalAgeDays]: Yup.number()
      .label('Days pregnant')
      .when([PatientField.isPregnant, PatientField.gestationalAgeUnit], {
        is: (isPregnant, gestationalAgeUnit) =>
          isPregnant && gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS,
        then: Yup.number()
          .integer('Please enter between 0 and 6 days.')
          .min(0, 'Please enter between 0 and 6 days.')
          .max(6, 'Please enter between 0 and 6 days.')
          .required('Please enter between 0 and 6 days.'),
      }),
    [PatientField.gestationalAgeWeeks]: Yup.number()
      .label('Weeks pregnant')
      .when([PatientField.isPregnant, PatientField.gestationalAgeUnit], {
        is: (isPregnant, gestationalAgeUnit) =>
          isPregnant && gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS,
        then: Yup.number()
          .integer('Please enter between 0 and 60 weeks.')
          .min(0, 'Please enter between 0 and 60 weeks.')
          .max(60, 'Please enter between 0 and 60 weeks.')
          .required('Please enter between 0 and 60 weeks.'),
      }),
    [PatientField.gestationalAgeMonths]: Yup.number()
      .label('Months pregnant')
      .when([PatientField.isPregnant, PatientField.gestationalAgeUnit], {
        is: (isPregnant, gestationalAgeUnit) =>
          isPregnant && gestationalAgeUnit === GestationalAgeUnitEnum.MONTHS,
        then: Yup.number()
          .integer('Please enter between 0 and 13 months.')
          .min(0, 'Please enter between 0 and 13 months.')
          .max(13, 'Please enter between 0 and 13 months.')
          .required('Please enter between 0 and 13 months.'),
      }),
  });
