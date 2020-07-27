import {
  GestationalAgeUnitDisplayEnum,
  GestationalAgeUnitEnum,
  SexDisplayEnum,
  SexEnum,
  YesNoDisplayEnum,
  YesNoEnum,
} from '../../../../../enums';

export const sexOptions = [
  { key: SexEnum.MALE, text: SexDisplayEnum.MALE, value: SexEnum.MALE },
  { key: SexEnum.FEMALE, text: SexDisplayEnum.FEMALE, value: SexEnum.FEMALE },
  { key: SexEnum.OTHER, text: SexDisplayEnum.OTHER, value: SexEnum.OTHER },
];

export const pregnantOptions = [
  {
    key: String(YesNoEnum.YES),
    text: YesNoDisplayEnum.YES,
    value: Boolean(YesNoEnum.YES),
  },
  {
    key: String(YesNoEnum.NO),
    text: YesNoDisplayEnum.NO,
    value: Boolean(YesNoEnum.NO),
  },
];

export const gestationalAgeUnitOptions = [
  {
    key: GestationalAgeUnitEnum.WEEKS,
    text: GestationalAgeUnitDisplayEnum.WEEKS,
    value: GestationalAgeUnitEnum.WEEKS,
  },
  {
    key: GestationalAgeUnitEnum.MONTHS,
    text: GestationalAgeUnitDisplayEnum.MONTHS,
    value: GestationalAgeUnitEnum.MONTHS,
  },
];
