import { GlobalSearchPatient, OrNull, Patient, Reading } from '@types';

import React from 'react';

export const useFilterReferredPatients = <
  T extends Array<GlobalSearchPatient> | Array<Patient>
>(): ((data: OrNull<T>) => Array<GlobalSearchPatient> | Array<Patient>) => {
  return React.useCallback((data: OrNull<T>):
    | Array<GlobalSearchPatient>
    | Array<Patient> => {
    if (data) {
      const areGlobalSearchPatients = (
        values: Array<GlobalSearchPatient> | Array<Patient>
      ): values is Array<GlobalSearchPatient> => {
        return values.every((value: GlobalSearchPatient | Patient): boolean => {
          return (value as GlobalSearchPatient).state !== undefined;
        });
      };

      const hasReferredReadings = (readings: Array<Reading>): boolean => {
        return readings.some((reading: Reading): boolean =>
          Boolean(reading.dateReferred)
        );
      };

      if (areGlobalSearchPatients(data)) {
        return (data as Array<GlobalSearchPatient>).filter(
          ({ readings }: GlobalSearchPatient): boolean => {
            return hasReferredReadings(readings);
          }
        );
      }

      return (data as Array<Patient>).filter(
        ({ readings }: Patient): boolean => {
          return hasReferredReadings(readings);
        }
      );
    }

    return [];
  }, []);
};
