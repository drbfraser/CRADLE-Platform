import { Callback, User } from '@types';

import { MUIDataTableColumn } from 'mui-datatables';
import { useActionsColumn } from './column/actions';
import { useEmailColumn } from './column/email';
import { useFirstNameColumn } from './column/firstName';
import { useHealthFacilityColumn } from './column/healthFacility';
import { useRolesColumn } from './column/roles';
import { useStyles } from './styles';

// * Order of enums is important
// * Must match order of columns in the table
export enum AdminTableColumnEnum {
  ACTIONS = 'ACTIONS',
  FIRST_NAME = 'FIRST_NAME',
  EMAIL = 'EMAIL',
  HEALTH_FACILITY = 'HEALTH_FACILITY',
  ROLES = 'ROLES',
}

interface IArgs {
  users: Array<User>;
  sortData: Callback<Array<User>>;
}

type TableColumns = { [key in AdminTableColumnEnum]: MUIDataTableColumn };

export const useTableColumns = ({
  users,
  sortData,
}: IArgs): Array<MUIDataTableColumn> => {
  const classes = useStyles();

  const actionsColumn = useActionsColumn({
    headClass: classes.headCell,
    bodyClass: classes.bodyCell,
    users,
    sortData,
  });
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

  const columns: TableColumns = {
    [AdminTableColumnEnum.ACTIONS]: actionsColumn,
    [AdminTableColumnEnum.FIRST_NAME]: firstNameColumn,
    [AdminTableColumnEnum.EMAIL]: emailColumn,
    [AdminTableColumnEnum.HEALTH_FACILITY]: healthFacilityColumn,
    [AdminTableColumnEnum.ROLES]: rolesColumn,
  };

  return Object.values(columns);
};
