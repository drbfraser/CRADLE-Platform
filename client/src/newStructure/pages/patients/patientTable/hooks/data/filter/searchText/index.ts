import { GlobalSearchPatient, OrNull, OrUndefined, Patient } from '@types';

import React from 'react';

interface IArgs {
  globalSearch: boolean;
  searchText: OrUndefined<string>;
}

export const useFilterBySearchText = <
  T extends Array<GlobalSearchPatient> | Array<Patient>
>({
  globalSearch,
  searchText,
}: IArgs): ((
  data: OrNull<T>
) => Array<GlobalSearchPatient> | Array<Patient>) => {
  return React.useCallback(
    (data: OrNull<T>): Array<GlobalSearchPatient> | Array<Patient> => {
      if (globalSearch) {
        return data ?? [];
      }

      if (data) {
        const areGlobalSearchPatients = (
          values: Array<GlobalSearchPatient> | Array<Patient>
        ): values is Array<GlobalSearchPatient> => {
          return values.every(
            (value: GlobalSearchPatient | Patient): boolean => {
              return (value as GlobalSearchPatient).state !== undefined;
            }
          );
        };

        const matchesSearchText = (
          patientId: string,
          patientName: string,
          searchText?: string
        ): boolean => {
          if (searchText === undefined) {
            return true;
          }
          const searchTextRegex = new RegExp(searchText);

          return (
            searchTextRegex.test(patientId) || searchTextRegex.test(patientName)
          );
        };

        if (areGlobalSearchPatients(data)) {
          return (data as Array<GlobalSearchPatient>).filter(
            ({ patientId, patientName }: GlobalSearchPatient): boolean => {
              return matchesSearchText(patientId, patientName, searchText);
            }
          );
        }

        return (data as Array<Patient>).filter(
          ({ patientId, patientName }: Patient): boolean => {
            return matchesSearchText(patientId, patientName, searchText);
          }
        );
      }

      return [];
    },
    [globalSearch, searchText]
  );
};
