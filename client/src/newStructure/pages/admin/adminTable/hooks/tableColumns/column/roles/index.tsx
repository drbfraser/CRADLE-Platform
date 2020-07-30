import { Callback, User } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import React from 'react';
import { RoleEnum } from '../../../../../../../enums';
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
      name: `roles`,
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
        customBodyRender: (roles: Array<RoleEnum>): JSX.Element => (
          <RolesBody className={bodyClass} roles={roles} />
        ),
        searchable: true,
      },
    };
  }, [headClass, bodyClass, users, sortData]);
};
