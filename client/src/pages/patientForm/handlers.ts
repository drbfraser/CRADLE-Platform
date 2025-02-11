import { SexEnum } from 'src/shared/enums';
import { initialState, PatientField } from './state';

export const handleChangeCustom = (handleChange: any, setFieldValue: any) => {
  const resetGestational = () => {
    [
      PatientField.gestationalAgeDays,
      PatientField.gestationalAgeWeeks,
      PatientField.gestationalAgeMonths,
      PatientField.gestationalAgeUnit,
    ].forEach((field) => {
      setFieldValue(field, initialState[field], false);
    });
  };

  return (e: React.ChangeEvent<any>) => {
    handleChange(e);

    if (
      e.target.name === PatientField.patientSex &&
      e.target.value === SexEnum.MALE
    ) {
      setFieldValue(PatientField.isPregnant, false, false);
      resetGestational();
    } else if (e.target.name === PatientField.isPregnant && !e.target.checked) {
      resetGestational();
    }
  };
};
