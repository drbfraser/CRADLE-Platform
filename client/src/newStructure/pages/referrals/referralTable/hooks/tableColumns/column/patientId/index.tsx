import { Callback, Patient } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { PatientIdBody } from './body';
import { PatientIdHead } from './head';
import React from 'react';

interface IArgs {
  headClass: string;
  bodyClass: string;
  patients: Array<Patient>;
  sortData: Callback<Array<Patient>>;
}

export const usePatientIdColumn = ({
  headClass,
  bodyClass,
  patients,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Patient ID`,
      name: `patientId`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <PatientIdHead
            key={index}
            className={headClass}
            data={patients}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (patientId: string): JSX.Element => (
          <PatientIdBody className={bodyClass} patientId={patientId} />
        ),
        searchable: true,
      },
    };
  }, [headClass, bodyClass, patients, sortData]);
};
