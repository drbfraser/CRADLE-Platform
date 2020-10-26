import { Callback, GlobalSearchPatient, Patient } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { PatientNameBody } from './body';
import { PatientNameHead } from './head';
import React from 'react';

interface IArgs {
  headClass: string;
  bodyClass: string;
  patients: Array<Patient> | Array<GlobalSearchPatient>;
  sortData: Callback<Array<Patient>>;
}

export const usePatientNameColumn = ({
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
          <PatientNameHead
            key={index}
            className={headClass}
            data={patients}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (patientName: string): JSX.Element => (
          <PatientNameBody className={bodyClass} patientName={patientName} />
        ),
        searchable: true,
      },
    };
  }, [headClass, bodyClass, patients, sortData]);
};
