import { Callback, GlobalSearchPatient, Patient } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import React from 'react';
import { VillageBody } from './body';
import { VillageHead } from './head';

interface IArgs {
  headClass: string;
  bodyClass: string;
  patients: Array<Patient> | Array<GlobalSearchPatient>;
  sortData: Callback<Array<Patient>>;
}

export const useVillageColumn = ({
  headClass,
  bodyClass,
  patients,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Village`,
      name: `villageNumber`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <VillageHead
            key={index}
            className={headClass}
            data={patients}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (villageNumber: string): JSX.Element => (
          <VillageBody className={bodyClass} villageNumber={villageNumber} />
        ),
        searchable: true,
      },
    };
  }, [headClass, bodyClass, patients, sortData]);
};
