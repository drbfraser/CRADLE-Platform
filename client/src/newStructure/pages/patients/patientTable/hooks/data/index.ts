import { Callback, OrNull, Patient, Reading } from '@types';

import React from 'react';

interface IArgs {
  data: OrNull<Array<Patient>>;
  resetToPatientsBeforeSearch: Callback<Array<Patient>>;
}

interface IUseData {
  debounceInterval: number;
  globalSearch: boolean;
  setGlobalSearch: Callback<Callback<boolean, boolean>>;
  patients: Array<Patient>;
  patientsBeforeSearch: OrNull<Array<Patient>>;
  setPatientsBeforeSearch: Callback<Array<Patient>>;
  showReferredPatients: boolean;
  setShowReferredPatients: Callback<Callback<boolean, boolean>>;
};

export const useData = ({ data, resetToPatientsBeforeSearch }: IArgs): IUseData => {
  const [globalSearch, setGlobalSearch] = React.useState(false);

  const [showReferredPatients, setShowReferredPatients] = React.useState<
    boolean
  >(false);

  const defaultInterval = React.useRef<number>(200);
  const globalSearchInterval = React.useRef<number>(defaultInterval.current * 10);
  const debounceInterval = React.useMemo<number>(
    (): number => globalSearch ? globalSearchInterval.current : defaultInterval.current, 
    [globalSearch]
  );

  const patients = React.useMemo<Array<Patient>>((): Array<Patient> => 
    data ? data.filter(({ readings }: Patient): boolean => showReferredPatients 
      ? readings.some((reading: Reading): boolean => Boolean(reading.dateReferred))
      : true
    ) : [], 
    [data, showReferredPatients]
  );
  
  const [patientsBeforeSearch, setPatientsBeforeSearch] = React.useState<OrNull<Array<Patient>>>(
    null
  );
  const [resetPatientsBeforeSearch, setResetPatientsBeforeSearch] = React.useState<boolean>(false);

  React.useEffect((): void => {
    if (!globalSearch && patientsBeforeSearch) {
      resetToPatientsBeforeSearch(patientsBeforeSearch);
      setResetPatientsBeforeSearch(true);
    }
  }, [globalSearch, patientsBeforeSearch, resetToPatientsBeforeSearch]);
  
  React.useEffect((): void => {
    if (resetPatientsBeforeSearch) {
      setPatientsBeforeSearch(null);
      setResetPatientsBeforeSearch(false);
    }
  }, [resetPatientsBeforeSearch]);

  return {
    debounceInterval,
    globalSearch,
    setGlobalSearch,
    patients,
    patientsBeforeSearch,
    setPatientsBeforeSearch,
    showReferredPatients,
    setShowReferredPatients,
  };
};