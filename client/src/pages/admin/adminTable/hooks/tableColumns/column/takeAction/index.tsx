import {
  MUIDataTableColumn,
  MUIDataTableCustomHeadRenderer,
} from 'mui-datatables';

import { AutocompleteOption } from 'src/shared/components/input/autocomplete/utils';
import React from 'react';
import { TakeActionBody } from './body';
import { TakeActionContextProvider } from './context';
import { TakeActionHead } from './head';
import { User } from 'src/types';

interface IArgs {
  headClass: string;
  users: Array<User>;
  healthFacilityOptions: Array<AutocompleteOption<string, string>>;
  vhtOptions: Array<AutocompleteOption<string, number>>;
}

export const useTakeActionColumn = ({
  headClass,
  users,
  healthFacilityOptions,
  vhtOptions,
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
        customBodyRender: (id: number) => (
          <TakeActionContextProvider
            healthFacilityOptions={healthFacilityOptions}
            vhtOptions={vhtOptions}>
            <TakeActionBody userId={id} />
          </TakeActionContextProvider>
        ),
        searchable: false,
      },
    };
  }, [headClass, healthFacilityOptions, users, vhtOptions]);
};
