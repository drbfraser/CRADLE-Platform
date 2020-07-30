import { Callback, User } from '@types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { EmailBody } from './body';
import { EmailHead } from './head';
import React from 'react';

interface IArgs {
  headClass: string;
  bodyClass: string;
  users: Array<User>;
  sortData: Callback<Array<User>>;
}

export const useEmailColumn = ({
  headClass,
  bodyClass,
  users,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `Email`,
      name: `email`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <EmailHead
            key={index}
            className={headClass}
            data={users}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (email: string): JSX.Element => (
          <EmailBody className={bodyClass} email={email} />
        ),
        searchable: true,
      },
    };
  }, [headClass, bodyClass, users, sortData]);
};
