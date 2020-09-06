import { Callback, OrUndefined } from '@types';

import React from 'react';

interface IArgs {
  capitalize?: boolean;
  trim?: boolean;
  updateSearchText: Callback<OrUndefined<string>>;
}

export const useSearchChange = ({
  capitalize = true,
  trim = true,
  updateSearchText,
}: IArgs): Callback<OrUndefined<string>> => {
  return React.useMemo<Callback<OrUndefined<string>>>((): Callback<
    OrUndefined<string>
  > => {
    return (search?: string): void => {
      if (search) {
        // * For global search, the following is necessary as per the server requirements
        // * Trim to remove any whitespace
        // * Uppercase to match uppercased initials

        const trimmed = trim ? search.trim() : search;
        const capitalized = capitalize ? search.toUpperCase() : trimmed;

        updateSearchText(search ? capitalized : ``);
      } else {
        updateSearchText(``);
      }
    };
  }, [capitalize, trim, updateSearchText]);
};
