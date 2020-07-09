import {
  Callback,
  GlobalSearchPatient,
  OrNull,
  OrUndefined,
  Patient,
} from '@types';

import React from 'react';
import debounce from 'lodash/debounce';
import { useFilterBySearchText } from './filter/searchText';
import { useFilterReferredPatients } from './filter/referredPatients';

interface IArgs {
  data: OrNull<Array<Patient>>;
  globalSearch: boolean;
  globalSearchData: OrNull<Array<GlobalSearchPatient>>;
  searchText: OrUndefined<string>;
  showReferredPatients?: boolean;
  getPatients: Callback<string>;
  sortPatients: Callback<OrNull<Array<GlobalSearchPatient> | Array<Patient>>>;
}

interface IUseData {
  patients: Array<Patient> | Array<GlobalSearchPatient>;
  sortData: Callback<Array<Patient> | Array<GlobalSearchPatient>>;
}

export const useData = ({
  data,
  globalSearch,
  globalSearchData,
  searchText,
  showReferredPatients,
  getPatients,
  sortPatients,
}: IArgs): IUseData => {
  const filterBySearchText = useFilterBySearchText({
    globalSearch,
    searchText,
  });

  const filterReferredPatients = useFilterReferredPatients();

  const [patients, setPatients] = React.useState<
    Array<Patient> | Array<GlobalSearchPatient>
  >([]);

  React.useEffect((): void => {
    const dataToFilter = globalSearch ? globalSearchData : data;

    if (dataToFilter === null) {
      setPatients([]);
    }

    setPatients(
      showReferredPatients
        ? filterBySearchText(filterReferredPatients(dataToFilter))
        : filterBySearchText(dataToFilter)
    );
  }, [
    data,
    filterBySearchText,
    filterReferredPatients,
    globalSearchData,
    globalSearch,
    showReferredPatients,
  ]);

  const sortData = (
    sortedPatients: Array<Patient> | Array<GlobalSearchPatient>
  ): void => {
    sortPatients(sortedPatients);
  };

  const debounceInterval = React.useRef<number>(1000);

  // Debounce get patients to prevent multiple server requests
  // Only send request after user has stopped typing for debounceInterval milliseconds
  const debouncedGetPatients = React.useCallback(
    debounce(getPatients, debounceInterval.current),
    [getPatients]
  );

  React.useEffect((): void => {
    if (globalSearch && searchText) {
      debouncedGetPatients(searchText);
    }
  }, [debouncedGetPatients, globalSearch, searchText]);

  return { patients, sortData };
};
