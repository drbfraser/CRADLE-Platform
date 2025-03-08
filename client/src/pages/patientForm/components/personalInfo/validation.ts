import * as Yup from 'yup';

import { PatientField } from '../../state';
import { getAgeBasedOnDOB } from 'src/shared/utils';

const ageIsValid = (age: number): boolean => {
  return Math.floor(age) >= 0;
};

export const personalInfoValidationSchema = Yup.object().shape({
  // For writing + testing Regex, see: regex101.com
  [PatientField.patientName]: Yup.string()
    .label('Name')
    .matches(/^\w[\w.'\- ]*$/, 'Name is not valid.')
    .required(),
  [PatientField.isExactDateOfBirth]: Yup.boolean(),
  [PatientField.dateOfBirth]: Yup.date().when(PatientField.isExactDateOfBirth, {
    is: true,
    then: Yup.date().test(
      'valid-dob',
      'Please enter a valid date of birth.',
      (date) => !!date && ageIsValid(getAgeBasedOnDOB(date.toDateString()))
    ),
  }),
  [PatientField.estimatedAge]: Yup.number().when(
    PatientField.isExactDateOfBirth,
    {
      is: false,
      then: Yup.number()
        .transform((value) => Math.floor(parseInt(value)))
        .integer('Please enter a valid age.')
        .test(
          'valid-age',
          'Please enter a valid age.',
          (age) => !!age && ageIsValid(age)
        ),
    }
  ),
  [PatientField.villageNumber]: Yup.number()
    .typeError('Village number must be numeric')
    .integer('Village number must be numeric')
    .min(1, 'Village number must be numeric'),
  [PatientField.isPregnant]: Yup.boolean(),
});
