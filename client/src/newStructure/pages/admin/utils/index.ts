import { UserOptionDisplayEnum, UserOptionEnum } from '../../../enums';

import { AutocompleteOption } from '../../../shared/components/input/autocomplete/utils';

export const oldRoleOptions = [
  {
    key: UserOptionDisplayEnum.VHT,
    text: UserOptionDisplayEnum.VHT,
    value: UserOptionEnum.VHT,
  },
  {
    key: UserOptionDisplayEnum.HCW,
    text: UserOptionDisplayEnum.HCW,
    value: UserOptionEnum.HCW,
  },
  {
    key: UserOptionDisplayEnum.ADMIN,
    text: UserOptionDisplayEnum.ADMIN,
    value: UserOptionEnum.ADMIN,
  },
  {
    key: UserOptionDisplayEnum.CHO,
    text: UserOptionDisplayEnum.CHO,
    value: UserOptionEnum.CHO,
  },
];

export const roleOptions = [
  {
    label: UserOptionDisplayEnum.VHT,
    value: UserOptionEnum.VHT,
  },
  {
    label: UserOptionDisplayEnum.HCW,
    value: UserOptionEnum.HCW,
  },
  {
    label: UserOptionDisplayEnum.ADMIN,
    value: UserOptionEnum.ADMIN,
  },
  {
    label: UserOptionDisplayEnum.CHO,
    value: UserOptionEnum.CHO,
  },
] as Array<AutocompleteOption<string, number>>;
