import { Callback, Patient, Reading } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { AssessmentBody } from './body';
import { AssessmentHead } from './head';
import React from 'react';

interface IArgs {
  headClass: string;
  bodyClass: string;
  patients: Array<Patient>;
  sortData: Callback<Array<Patient>>;
}

export const useAssessmentColumn = ({
  headClass,
  bodyClass,
  patients,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Assessment`,
      name: `readings`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <AssessmentHead
            key={index}
            className={headClass}
            data={patients}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (readings: Array<Reading>) => (
          <AssessmentBody className={bodyClass} readings={readings} />
        ),
        searchable: false,
      },
    };
  }, [headClass, bodyClass, patients, sortData]);
};
