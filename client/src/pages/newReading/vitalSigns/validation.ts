import * as Yup from 'yup';
import { ReadingField } from '../state';

const wholeNumErr = (min: number, max: number) =>
  `Must be a whole number between ${min} - ${max}.`;
const requiredErr = 'This field is required.';
const urineTestValidation = Yup.string().when(ReadingField.urineTest, {
  is: true,
  then: Yup.string().required(requiredErr),
});

export const vitalSignsValidationSchema = Yup.object().shape({
  [ReadingField.bpSystolic]: Yup.number()
    .integer(wholeNumErr(50, 300))
    .min(50, wholeNumErr(50, 300))
    .max(300, wholeNumErr(50, 300))
    .required(requiredErr),
  [ReadingField.bpDiastolic]: Yup.number()
    .integer(wholeNumErr(30, 200))
    .min(30, wholeNumErr(30, 200))
    .max(200, wholeNumErr(30, 200))
    .required(requiredErr),
  [ReadingField.heartRateBPM]: Yup.number()
    .integer(wholeNumErr(30, 250))
    .min(30, wholeNumErr(30, 250))
    .max(250, wholeNumErr(30, 250))
    .required(requiredErr),
  [ReadingField.urineTest]: Yup.boolean(),
  [ReadingField.leukocytes]: urineTestValidation,
  [ReadingField.nitrites]: urineTestValidation,
  [ReadingField.glucose]: urineTestValidation,
  [ReadingField.protein]: urineTestValidation,
  [ReadingField.blood]: urineTestValidation,
});
