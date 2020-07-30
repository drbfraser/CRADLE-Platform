import { OrNull, OrUndefined, User } from '@types';

import React from 'react';
import { RoleEnum } from 'src/newStructure/enums';

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
          roles: Array<RoleEnum>,
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
            roles.some((role: RoleEnum): boolean => role.startsWith(searchText))
          );
        };

        return (data as Array<User>).filter(
          ({ firstName, email, healthFacilityName, roles }: User): boolean => {
            return matchesSearchText(
              firstName,
              email,
              healthFacilityName,
              roles,
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
