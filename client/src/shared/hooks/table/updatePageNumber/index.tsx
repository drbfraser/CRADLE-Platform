import { Callback } from '@types';
import React from 'react';

interface IArgs {
  update: Callback<number>;
}

export const useUpdatePageNumber = ({ update }: IArgs): Callback<number> => {
  return React.useMemo((): Callback<number> => {
    return (pageNumber: number): void => {
      update(pageNumber);
    };
  }, [update]);
};
