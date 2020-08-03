import {
  GestationalAgeUnitDisplayEnum,
  GestationalAgeUnitEnum,
  SexDisplayEnum,
  SexEnum,
  YesNoDisplayEnum,
  YesNoEnum,
} from '../../../../../../../enums';

export const sexOptions = [
  { label: SexDisplayEnum.MALE, value: SexEnum.MALE },
  { label: SexDisplayEnum.FEMALE, value: SexEnum.FEMALE },
  { label: SexDisplayEnum.OTHER, value: SexEnum.OTHER },
];

export const pregnantOptions = [
  {
    label: YesNoDisplayEnum.YES,
    value: Boolean(YesNoEnum.YES),
  },
  {
    label: YesNoDisplayEnum.NO,
    value: Boolean(YesNoEnum.NO),
  },
];

export const gestationalAgeUnitOptions = [
  {
    label: GestationalAgeUnitDisplayEnum.WEEKS,
    value: GestationalAgeUnitEnum.WEEKS,
  },
  {
    label: GestationalAgeUnitDisplayEnum.MONTHS,
    value: GestationalAgeUnitEnum.MONTHS,
  },
];
