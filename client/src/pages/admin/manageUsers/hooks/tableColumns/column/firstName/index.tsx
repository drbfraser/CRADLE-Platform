import { Callback, User } from 'src/types';
import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { FirstNameBody } from './body';
import { FirstNameHead } from './head';
import React from 'react';

interface IArgs {
  headClass: string;
  bodyClass: string;
  users: Array<User>;
  sortData: Callback<Array<User>>;
}

export const useFirstNameColumn = ({
  headClass,
  bodyClass,
  users,
  sortData,
}: IArgs): MUIDataTableColumn => {
  return React.useMemo(() => {
    return {
      label: `First Name`,
      name: `firstName`,
      options: {
        customHeadRender: ({
          label,
          index,
        }: MUIDataTableCustomHeadRenderer): JSX.Element => (
          <FirstNameHead
            key={index}
            className={headClass}
            data={users}
            label={label}
            sortData={sortData}
          />
        ),
        customBodyRender: (firstName: string) => (
          <FirstNameBody className={bodyClass} firstName={firstName} />
        ),
        searchable: false,
      },
    };
  }, [headClass, bodyClass, users, sortData]);
};
