import { Callback, User } from '@types';

import { AutocompleteOption } from '../../../../../shared/components/input/autocomplete/utils';
import { MUIDataTableColumn } from 'mui-datatables';
import { useEmailColumn } from './column/email';
import { useFirstNameColumn } from './column/firstName';
import { useHealthFacilityColumn } from './column/healthFacility';
import { useRolesColumn } from './column/roles';
import { useStyles } from '../../../../../shared/components/table/styles';
import { useTakeActionColumn } from './column/takeAction';

// * Order of enums is important
// * Must match order of columns in the table
export enum AdminTableColumnEnum {
  FIRST_NAME = 'FIRST_NAME',
  EMAIL = 'EMAIL',
  HEALTH_FACILITY = 'HEALTH_FACILITY',
  ROLES = 'ROLES',
  TAKE_ACTION = 'TAKE_ACTION',
}

interface IArgs {
  users: Array<User>;
  healthFacilityOptions: Array<AutocompleteOption<string, string>>;
  vhtOptions: Array<AutocompleteOption<string, number>>;
  sortData: Callback<Array<User>>;
}

type TableColumns = { [key in AdminTableColumnEnum]: MUIDataTableColumn };

export const useTableColumns = ({
  users,
  healthFacilityOptions,
  vhtOptions,
  sortData,
}: IArgs): Array<MUIDataTableColumn> => {
  const classes = useStyles();

  const firstNameColumn = useFirstNameColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    users,
    sortData,
  });
  const emailColumn = useEmailColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    users,
    sortData,
  });
  const healthFacilityColumn = useHealthFacilityColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    users,
    sortData,
  });
  const rolesColumn = useRolesColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    users,
    sortData,
  });
  const takeActionColumn = useTakeActionColumn({
    headClass: classes.headCell,
    users,
    healthFacilityOptions,
    vhtOptions,
  });

  const columns: TableColumns = {
    [AdminTableColumnEnum.FIRST_NAME]: firstNameColumn,
    [AdminTableColumnEnum.EMAIL]: emailColumn,
    [AdminTableColumnEnum.HEALTH_FACILITY]: healthFacilityColumn,
    [AdminTableColumnEnum.ROLES]: rolesColumn,
    [AdminTableColumnEnum.TAKE_ACTION]: takeActionColumn,
  };

  return Object.values(columns);
};
