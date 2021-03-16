import { Callback, OrUndefined } from 'src/types';

import React from 'react';

interface IArgs {
  updateSearchText: Callback<OrUndefined<string>>;
}

export const useSearchChange = ({
  updateSearchText,
}: IArgs): Callback<OrUndefined<string>> => {
  return React.useMemo<Callback<OrUndefined<string>>>((): Callback<
    OrUndefined<string>
  > => {
    return (search?: string): void => {
      if (search) {
        updateSearchText(search ? search : ``);
      } else {
        updateSearchText(``);
      }
    };
  }, [updateSearchText]);
};
