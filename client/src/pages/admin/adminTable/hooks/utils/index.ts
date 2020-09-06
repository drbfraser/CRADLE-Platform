import { RoleEnum } from '../../../../../enums';

export const getRoles = (roleIds: Array<number>): Array<RoleEnum> => {
  const roles = Object.values(RoleEnum);

  return roleIds.map(
    (id: number): RoleEnum => {
      // * Role ids start from 1 to 4 in the order of the RoleEnum
      return roles[id - 1];
    }
  );
};
