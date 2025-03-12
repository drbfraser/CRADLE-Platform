import { gestationalAgeUnitLabels } from 'src/shared/constants';
import { GestationalAgeUnitEnum } from 'src/shared/enums';

export const UNIT_OPTIONS = Object.values(GestationalAgeUnitEnum).map(
  (unit) => ({
    key: unit,
    text: gestationalAgeUnitLabels[unit],
    value: unit,
  })
);
