import { GlobalSearchPatient, Patient } from '@types';
import {
  initials,
  patientId,
  village,
  vitalSign,
} from '../../../../../shared/components/table/columns';
import { lastReadingDate, state } from './utils';

import { Column } from 'material-table';
import React from 'react';

interface IArgs {
  globalSearch: boolean;
}

export const useColumns = ({
  globalSearch,
}: IArgs): Array<Column<Patient | GlobalSearchPatient>> => {
  return React.useMemo<Array<Column<Patient | GlobalSearchPatient>>>(() => {
    const allColumns = [
      initials,
      patientId,
      village,
      vitalSign,
      lastReadingDate,
    ];

    if (globalSearch) {
      allColumns.push(state);
    }

    return allColumns;
  }, [globalSearch]);
};
