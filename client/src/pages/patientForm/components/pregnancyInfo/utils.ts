import {
  gestationalAgeUnitTimestamp,
  gestationalAgeUnitTimestampWithEndDate,
} from 'src/shared/constants';
import { GestationalAgeUnitEnum } from 'src/shared/enums';
import { PatientField, PatientState } from '../../state';

export type PregnancySubmitValues = {
  patientId: string;
  startDate: number;
  endDate?: number;
  outcome?: string;
};

export const processPregnancyValues = (
  rawValues: PatientState
): Omit<PregnancySubmitValues, 'patientId'> => {
  const submitValues = {
    startDate: 0,
    endDate: Number(rawValues[PatientField.pregnancyEndDate]) || undefined,
    outcome: rawValues[PatientField.pregnancyOutcome],
  };

  const gestationalAgeUnit = rawValues[PatientField.gestationalAgeUnit];
  if (submitValues.endDate) {
    submitValues.startDate =
      gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
        ? gestationalAgeUnitTimestampWithEndDate[GestationalAgeUnitEnum.WEEKS](
            rawValues.gestationalAgeWeeks,
            rawValues.gestationalAgeDays,
            submitValues.endDate.toString()
          )
        : gestationalAgeUnitTimestampWithEndDate[GestationalAgeUnitEnum.MONTHS](
            rawValues.gestationalAgeMonths,
            submitValues.endDate.toString()
          );
  } else {
    submitValues.startDate =
      gestationalAgeUnit === GestationalAgeUnitEnum.WEEKS
        ? gestationalAgeUnitTimestamp[GestationalAgeUnitEnum.WEEKS](
            rawValues.gestationalAgeWeeks,
            rawValues.gestationalAgeDays
          )
        : gestationalAgeUnitTimestamp[GestationalAgeUnitEnum.MONTHS](
            rawValues.gestationalAgeMonths
          );
  }

  if (rawValues[PatientField.pregnancyEndDate]) {
    submitValues.endDate =
      Date.parse(rawValues[PatientField.pregnancyEndDate]) / 1000;
  } else {
    submitValues.endDate = undefined;
  }

  submitValues.startDate = Math.trunc(Number(submitValues.startDate));
  submitValues.endDate = Math.trunc(Number(submitValues.endDate));
  return submitValues;
};
