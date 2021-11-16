import * as Yup from 'yup';
import { getAgeBasedOnDOB } from 'src/shared/utils';
import { PatientField } from '../state';

const ageIsValid = (age: number): boolean => {
  return age >= 15 && age <= 65;
};

export const personalInfoValidationSchema = (creatingNew: boolean) =>
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
  });
