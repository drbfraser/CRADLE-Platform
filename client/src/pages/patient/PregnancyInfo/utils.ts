import { gestationalAgeUnitLabels } from 'src/shared/constants';
import { GestationalAgeUnitEnum } from 'src/shared/enums';

export const createNewPregnancyURL = (patientId: string) =>
  `/patients/${patientId}/new/pregnancy`;

export const createEditPregnancyURL = (
  patientId: string,
  pregnancyId: string
) => `/patients/${patientId}/edit/pregnancyInfo/${pregnancyId}`;

export const UNIT_OPTIONS = Object.values(GestationalAgeUnitEnum).map(
  (unit) => ({
    key: unit,
    text: gestationalAgeUnitLabels[unit],
    value: unit,
  })
);
