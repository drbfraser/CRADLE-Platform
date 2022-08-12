import * as Yup from 'yup';

import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { PatientField } from '../state';

export const pregnancyInfoValidationSchema = () =>
  Yup.object().shape({
    [PatientField.isPregnant]: Yup.boolean(),
    [PatientField.gestationalAgeDays]: Yup.number()
      .min(0, 'Please enter a number between 0 and 6')
      .max(6, 'Please enter a number between 0 and 6')
      .label('Days pregnant')
      .when([PatientField.isPregnant, PatientField.gestationalAgeUnit], {
        is: (isPregnant: boolean, gestationalAgeUnit: string) =>
          isPregnant && gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS,
        then: Yup.number()
          .integer('Please enter between 0 and 6 days.')
          .min(0, 'Please enter between 0 and 6 days.')
          .max(6, 'Please enter between 0 and 6 days.')
          .required('Please enter between 0 and 6 days.'),
      }),
    [PatientField.gestationalAgeWeeks]: Yup.number()
      .min(0, 'Please enter a positive number')
      .label('Weeks pregnant')
      .when([PatientField.isPregnant, PatientField.gestationalAgeUnit], {
        is: (isPregnant: boolean, gestationalAgeUnit: string) =>
          isPregnant && gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS,
        then: Yup.number()
          .integer('Please enter between 0 and 42 weeks.')
          .min(0, 'Please enter between 0 and 42 weeks.')
          .max(42, 'Please enter between 0 and 42 weeks.')
          .required('Please enter between 0 and 42 weeks.'),
      }),
    [PatientField.gestationalAgeMonths]: Yup.number()
      .min(0, 'Please enter a positive number')
      .label('Months pregnant')
      .when([PatientField.isPregnant, PatientField.gestationalAgeUnit], {
        is: (isPregnant: boolean, gestationalAgeUnit: string) =>
          isPregnant && gestationalAgeUnit === GestationalAgeUnitEnum.MONTHS,
        then: Yup.number()
          .integer('Please enter between 0 and 10 months.')
          .min(0, 'Please enter between 0 and 10 months.')
          .max(10, 'Please enter between 0 and 10 months.')
          .required('Please enter between 0 and 10 months.'),
      }),
    [PatientField.pregnancyEndDate]: Yup.date().max(
      new Date(),
      'Date must not be in the future.'
    ),
  });
