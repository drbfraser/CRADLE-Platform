import { Callback, GlobalSearchPatient, OrNull, Patient } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import React from 'react';
import { TakeActionBody } from './body';
import { TakeActionHead } from './head';

interface IArgs {
  headClass: string;
  bodyClass: string;
  patients: Array<Patient> | Array<GlobalSearchPatient>;
  onGlobalSearchPatientSelected: Callback<string>;
}

export const useTakeActionColumn = ({
  headClass,
  bodyClass,
  patients,
  onGlobalSearchPatientSelected,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Take Action`,
      name: `patientId`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <TakeActionHead key={index} className={headClass} label={label} />
        ),
        customBodyRender: (patientId: string): OrNull<JSX.Element> => (
          <TakeActionBody
            className={bodyClass}
            patientId={patientId}
            patients={patients as Array<GlobalSearchPatient>}
            onGlobalSearchPatientSelected={onGlobalSearchPatientSelected}
          />
        ),
      },
    };
  }, [headClass, bodyClass, patients, onGlobalSearchPatientSelected]);
};
