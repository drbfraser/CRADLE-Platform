import { Callback, GlobalSearchPatient, Patient, Reading } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { LastReadingDateBody } from './body';
import { LastReadingDateHead } from './head';
import React from 'react';

interface IArgs {
  headClass: string;
  bodyClass: string;
  patients: Array<Patient> | Array<GlobalSearchPatient>;
  sortData: Callback<Array<Patient>>;
}

export const useLastReadingDateColumn = ({
  headClass,
  bodyClass,
  patients,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Last Reading Date`,
      name: `readings`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <LastReadingDateHead
            key={index}
            className={headClass}
            data={patients}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (readings: Array<Reading>) => (
          <LastReadingDateBody className={bodyClass} readings={readings} />
        ),
        searchable: false,
      },
    };
  }, [headClass, bodyClass, patients, sortData]);
};
