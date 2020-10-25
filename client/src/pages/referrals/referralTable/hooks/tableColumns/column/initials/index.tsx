import { Callback, Patient } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { InitialsBody } from './body';
import { InitialsHead } from './head';
import React from 'react';

interface IArgs {
  headClass: string;
  bodyClass: string;
  patients: Array<Patient>;
  sortData: Callback<Array<Patient>>;
}

export const useInitialsColumn = ({
  headClass,
  bodyClass,
  patients,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Patient Name`,
      name: `patientName`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <InitialsHead
            key={index}
            className={headClass}
            data={patients}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (patientName: string): JSX.Element => (
          <InitialsBody className={bodyClass} initials={patientName} />
        ),
        searchable: true,
      },
    };
  }, [headClass, bodyClass, patients, sortData]);
};
