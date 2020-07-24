import {
  Callback,
  GlobalSearchPatient,
  OrNull,
  OrUndefined,
  Patient,
} from '@types';

import React from 'react';
import { useFilterBySearchText } from '../../../../../shared/hooks/table/filterBySearchText';

interface IArgs {
  data: OrNull<Array<Patient> | Array<GlobalSearchPatient>>;
  searchText: OrUndefined<string>;
  sortPatients: Callback<OrNull<Array<Patient>>>;
}

interface IUseData {
  patients: Array<Patient>;
  sortData: Callback<Array<Patient>>;
}

export const useData = ({
  data,
  searchText,
  sortPatients,
}: IArgs): IUseData => {
  const filterBySearchText = useFilterBySearchText({
    searchText,
  });

  const [patients, setPatients] = React.useState<Array<Patient>>([]);

  React.useEffect((): void => {
    if (data === null) {
      setPatients([]);
    }

    setPatients(filterBySearchText(data) as Array<Patient>);
  }, [data, filterBySearchText]);

  const sortData = (sortedPatients: Array<Patient>): void => {
    sortPatients(sortedPatients);
  };

  return { patients, sortData };
};
