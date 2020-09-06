import { Callback, Patient, Reading } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { DateReferredBody } from './body';
import { DateReferredHead } from './head';
import React from 'react';

interface IArgs {
  headClass: string;
  bodyClass: string;
  patients: Array<Patient>;
  sortData: Callback<Array<Patient>>;
}

export const useDateReferredColumn = ({
  headClass,
  bodyClass,
  patients,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Date Referred`,
      name: `readings`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <DateReferredHead
            key={index}
            className={headClass}
            data={patients}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (readings: Array<Reading>) => (
          <DateReferredBody className={bodyClass} readings={readings} />
        ),
        searchable: false,
      },
    };
  }, [headClass, bodyClass, patients, sortData]);
};
