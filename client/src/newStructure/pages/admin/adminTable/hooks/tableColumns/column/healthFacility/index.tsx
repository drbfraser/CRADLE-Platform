import { Callback, User } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { HealthFacilityBody } from './body';
import { HealthFacilityHead } from './head';
import React from 'react';

interface IArgs {
  headClass: string;
  bodyClass: string;
  users: Array<User>;
  sortData: Callback<Array<User>>;
}

export const useHealthFacilityColumn = ({
  headClass,
  bodyClass,
  users,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Health Facility`,
      name: `healthFacility`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <HealthFacilityHead
            key={index}
            className={headClass}
            data={users}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (healthFacility: string): JSX.Element => (
          <HealthFacilityBody
            className={bodyClass}
            healthFacility={healthFacility}
          />
        ),
        searchable: true,
      },
    };
  }, [headClass, bodyClass, users, sortData]);
};
