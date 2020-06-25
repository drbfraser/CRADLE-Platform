import { Callback } from '@types';
import React from 'react';

interface IArgs {
  globalSearch: boolean;
  update: Callback<number>;
}

export const useUpdatePageNumber = ({
  globalSearch,
  update,
}: IArgs): Callback<number> => {
  return React.useMemo((): Callback<number> => {
    return (pageNumber: number): void => {
      if (globalSearch) {
        update(pageNumber);
      }
    };
  }, [globalSearch, update]);
};
