import * as Yup from 'yup';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { PatientField } from '../state';

export const pregnancyInfoValidationSchema = () =>
  Yup.object().shape({
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
    [PatientField.pregnancyEndDate]: Yup.date().max(
      new Date(),
      'Date must not be in the future.'
    ),
  });
