import { OrNull, OrUndefined, User } from 'src/types';

import React from 'react';
import { RoleEnum } from 'src/enums';
import { getRoles } from '../../utils';

interface IArgs {
  searchText: OrUndefined<string>;
}

export const useFilterBySearchText = ({
  searchText,
}: IArgs): ((data: OrNull<Array<User>>) => Array<User>) => {
  return React.useCallback(
    (data: OrNull<Array<User>>): Array<User> => {
      if (data) {
        const matchesSearchText = (
          firstName: string,
          email: string,
          healthFacilityName: string,
          roleIds: Array<number>,
          searchText?: string
        ): boolean => {
          if (searchText === undefined) {
            return true;
          }

          const searchTextRegex = new RegExp(searchText);

          return (
            searchTextRegex.test(firstName) ||
            searchTextRegex.test(email) ||
            searchTextRegex.test(healthFacilityName) ||
            getRoles(roleIds).some((role: RoleEnum): boolean => {
              return role.toLowerCase().includes(searchText.toLowerCase());
            })
          );
        };

        return (data as Array<User>).filter(
          ({
            firstName,
            email,
            healthFacilityName,
            roleIds,
          }: User): boolean => {
            return matchesSearchText(
              firstName,
              email,
              healthFacilityName,
              roleIds,
              searchText
            );
          }
        );
      }

      return [];
    },
    [searchText]
  );
};
