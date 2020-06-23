import { Callback, OrUndefined } from '@types';

import React from 'react';
import debounce from 'lodash/debounce';

interface IArgs {
  debounceInterval: number;
  globalSearch: boolean;
  getPatients: Callback<string>;
}

export const useSearchChange = ({
  debounceInterval,
  globalSearch,
  getPatients,
}: IArgs): Callback<OrUndefined<string>> => {
  // Debounce get patients to prevent multiple server requests
  // Only send request after user has stopped typing for debounceInterval milliseconds
  const debouncedGetPatients = React.useCallback(
    debounce(getPatients, debounceInterval),
    [debounceInterval, getPatients]
  );

  return React.useMemo<Callback<OrUndefined<string>>>((): any => {
    if (globalSearch) {
      return (searchText?: string): void => {
        if (searchText) {
          debouncedGetPatients(searchText);
        }
      };
    }

    return (): void => {
      return;
    };
  }, [debouncedGetPatients, globalSearch]);
};
