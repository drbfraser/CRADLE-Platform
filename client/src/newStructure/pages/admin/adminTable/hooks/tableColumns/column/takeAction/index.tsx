import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import React from 'react';
import { TakeActionBody } from './body';
import { TakeActionHead } from './head';
import { User } from '@types';

interface IArgs {
  headClass: string;
  users: Array<User>;
}

export const useTakeActionColumn = ({
  headClass,
  users,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Take Action`,
      name: `id`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <TakeActionHead
            key={index}
            className={headClass}
            data={users}
            label={label}
          />
        ),
        customBodyRender: (id: number) => <TakeActionBody userId={id} />,
        searchable: false,
      },
    };
  }, [headClass, users]);
};
