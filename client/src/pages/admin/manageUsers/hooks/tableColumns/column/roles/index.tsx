import { Callback, User } from 'src/types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import React from 'react';
import { RolesBody } from './body';
import { RolesHead } from './head';

interface IArgs {
  headClass: string;
  bodyClass: string;
  users: Array<User>;
  sortData: Callback<Array<User>>;
}

export const useRolesColumn = ({
  headClass,
  bodyClass,
  users,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Roles`,
      name: `roleIds`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <RolesHead
            key={index}
            className={headClass}
            data={users}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (roleIds: Array<number>): JSX.Element => (
          <RolesBody className={bodyClass} roleIds={roleIds} />
        ),
        searchable: true,
      },
    };
  }, [headClass, bodyClass, users, sortData]);
};
