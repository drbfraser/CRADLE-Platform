import { Column, Options } from 'material-table';
import { GlobalSearchPatient, Patient } from '@types';
import {
  getLatestReadingDateTime,
  getPrettyDate,
  sortPatientsByLastReading,
} from '../../../../shared/utils';

import React from 'react';

export const lastReadingDate: Column<Patient | GlobalSearchPatient> = {
  title: `Date of Last Reading`,
  field: `lastReading`,
  render: (rowData: Patient | GlobalSearchPatient) => (
    <p>{getPrettyDate(getLatestReadingDateTime(rowData.readings))}</p>
  ),
  customSort: (
    patient: Patient | GlobalSearchPatient,
    otherPatient: Patient | GlobalSearchPatient
  ) => sortPatientsByLastReading(patient, otherPatient),
  defaultSort: `asc` as `asc`,
};

interface IOptionsArgs {
  debounceInterval: number;
  globalSearch: boolean;
  globalSearchPageNumber: number;
}

export const options = ({
  debounceInterval,
  globalSearch,
  globalSearchPageNumber,
}: IOptionsArgs): Options => ({
  actionsCellStyle: { minWidth: 100, padding: `0 1rem` },
  actionsColumnIndex: -1,
  debounceInterval,
  initialPage: globalSearch ? globalSearchPageNumber : 0,
  pageSize: 10,
  rowStyle: (): React.CSSProperties => ({
    height: 75,
  }),
  searchAutoFocus: globalSearch,
  searchFieldVariant: `outlined`,
  searchFieldStyle: { marginBlockStart: `1rem` },
  sorting: true,
});
