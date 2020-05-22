import { GESTATIONAL_AGE_UNITS } from '../../../../utils';

export const sexOptions = [
  { key: `m`, text: `Male`, value: `MALE` },
  { key: `f`, text: `Female`, value: `FEMALE` },
  { key: `o`, text: `Other`, value: `I` },
];

export const pregnantOptions = [
  { key: `y`, text: `Yes`, value: true },
  { key: `n`, text: `No`, value: false },
];

export const gestationalAgeUnitOptions = [
  { key: `week`, text: `Weeks`, value: GESTATIONAL_AGE_UNITS.WEEKS },
  { key: `month`, text: `Months`, value: GESTATIONAL_AGE_UNITS.MONTHS },
];
