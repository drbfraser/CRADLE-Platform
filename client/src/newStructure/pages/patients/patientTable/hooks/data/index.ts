import {
  Callback,
  GlobalSearchPatient,
  OrNull,
  Patient,
  Reading,
} from '@types';

import React from 'react';

interface IArgs {
  data: OrNull<Array<Patient>>;
  globalSearch: boolean;
  globalSearchData: OrNull<Array<GlobalSearchPatient>>;
}

interface IUseData {
  debounceInterval: number;
  patients: Array<Patient> | Array<GlobalSearchPatient>;
  showReferredPatients: boolean;
  setShowReferredPatients: Callback<Callback<boolean, boolean>>;
}

export const useData = ({ data, globalSearch, globalSearchData }: IArgs): IUseData => {
  const [showReferredPatients, setShowReferredPatients] = React.useState<
    boolean
  >(false);

  const defaultInterval = React.useRef<number>(200);
  const globalSearchInterval = React.useRef<number>(1000);
  const debounceInterval = React.useMemo<number>(
    (): number =>
      globalSearch ? globalSearchInterval.current : defaultInterval.current,
    [globalSearch]
  );

  const filter = React.useCallback(
    <T extends { readings: Array<Reading> }>(data: OrNull<Array<T>>) => {
      return (data ?? []).filter(({ readings }: T): boolean => {
        if (showReferredPatients) {
          return readings.some((reading: Reading): boolean =>
            Boolean(reading.dateReferred)
          );
        }

        return true;
      });
    },
    [showReferredPatients]
  );

  const patients = React.useMemo<
    Array<Patient> | Array<GlobalSearchPatient>
  >((): Array<Patient> | Array<GlobalSearchPatient> => {
    return globalSearch ? filter(globalSearchData) : filter(data);
  }, [data, filter, globalSearchData, globalSearch]);

  return {
    debounceInterval,
    patients,
    showReferredPatients,
    setShowReferredPatients,
  };
};
