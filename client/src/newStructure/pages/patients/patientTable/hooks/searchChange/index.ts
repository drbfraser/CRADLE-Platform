import { Callback, OrUndefined } from '@types';

import React from 'react';

interface IArgs {
  updateSearchText: Callback<OrUndefined<string>>;
}

export const useSearchChange = ({
  updateSearchText,
}: IArgs): Callback<OrUndefined<string>> => {
  return React.useMemo<Callback<OrUndefined<string>>>((): any => {
    return (search?: string): void => {
      // * Trim to remove any whitespace
      // * Uppercase to match uppercased initials
      updateSearchText(search ? search.trim().toUpperCase() : ``);
    };
  }, [updateSearchText]);
};
