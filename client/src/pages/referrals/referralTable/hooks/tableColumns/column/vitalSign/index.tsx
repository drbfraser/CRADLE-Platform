import { Callback, Patient, Reading } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import React from 'react';
import { VitalSignBody } from './body';
import { VitalSignHead } from './head';

interface IArgs {
  headClass: string;
  bodyClass: string;
  patients: Array<Patient>;
  sortData: Callback<Array<Patient>>;
}

export const useVitalSignColumn = ({
  headClass,
  bodyClass,
  patients,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Vital Sign`,
      name: `readings`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <VitalSignHead
            key={index}
            className={headClass}
            data={patients}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (readings: Array<Reading>) => (
          <VitalSignBody className={bodyClass} readings={readings} />
        ),
        searchable: false,
      },
    };
  }, [headClass, bodyClass, patients, sortData]);
};
