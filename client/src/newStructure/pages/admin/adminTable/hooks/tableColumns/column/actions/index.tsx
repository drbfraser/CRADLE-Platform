import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { ActionsBody } from './body';
import { ActionsHead } from './head';
import React from 'react';
import { User } from '@types';

interface IArgs {
  headClass: string;
  users: Array<User>;
}

export const useActionsColumn = ({
  headClass,
  users,
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
        customBodyRender: (id: string) => <ActionsBody id={id} />,
        searchable: false,
      },
    };
  }, [headClass, users]);
};
