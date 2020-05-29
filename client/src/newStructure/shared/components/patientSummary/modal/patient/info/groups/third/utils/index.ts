import { GESTATIONAL_AGE_UNITS } from '../../../../../../../../utils';

export const pregnantOptions = [
  { key: `y`, text: `Yes`, value: true },
  { key: `n`, text: `No`, value: false },
];

export const gestationalAgeUnitOptions = [
  { key: `week`, text: `Weeks`, value: GESTATIONAL_AGE_UNITS.WEEKS },
  { key: `month`, text: `Months`, value: GESTATIONAL_AGE_UNITS.MONTHS },
];
