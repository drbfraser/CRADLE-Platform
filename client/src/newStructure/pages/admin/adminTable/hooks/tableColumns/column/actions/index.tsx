import { Callback, User } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { ActionsBody } from './body';
import { ActionsHead } from './head';
import React from 'react';

interface IArgs {
  headClass: string;
  bodyClass: string;
  users: Array<User>;
  sortData: Callback<Array<User>>;
}

export const useActionsColumn = ({
  headClass,
  bodyClass,
  users,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Actions`,
      name: `id`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <ActionsHead
            key={index}
            className={headClass}
            data={users}
            label={label}
          />
        ),
        customBodyRender: (id: string) => (
          <ActionsBody className={bodyClass} id={id} />
        ),
        searchable: false,
      },
    };
  }, [headClass, bodyClass, users, sortData]);
};
