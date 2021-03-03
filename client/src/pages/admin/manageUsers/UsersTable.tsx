import { Callback, OrNull, OrUndefined, User } from 'src/types';
import { useDispatch, useSelector } from 'react-redux';

import MUIDataTable from 'mui-datatables';
import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { Toast } from 'src/shared/components/toast';
import { clearAllVhtsRequestOutcome } from 'src/redux/reducers/user/allVhts';
import { clearHealthFacilitiesRequestOutcome } from 'src/redux/reducers/healthFacilities';
import { customRowRender } from 'src/shared/components/table/row';
import { customToolbarRender } from './toolbar';
import { updateRowsPerPage } from 'src/redux/reducers/user/allUsers';
import { useData } from './hooks/data';
import { useHealthFacilityOptions } from 'src/shared/hooks/healthFacilityOptions';
import { useLocalization } from 'src/shared/hooks/table/localization';
import { useSearchChange } from 'src/shared/hooks/table/searchChange';
import { useStyles } from './styles';
import { useTableColumns } from './hooks/tableColumns';
import { useUpdatePageNumber } from 'src/shared/hooks/table/updatePageNumber';
import { useVHTOptions } from './hooks/vhtOptions';

interface IProps {
  data: OrNull<Array<User>>;
  pageNumber: number;
  loading: boolean;
  sortUsers: Callback<OrNull<Array<User>>>;
  updatePageNumber: Callback<number>;
  updateSearchText: Callback<OrUndefined<string>>;
  searchText?: string;
}

type SelectorState = {
  error: OrNull<string>;
  rowsPerPage: number;
};

export const UsersTable: React.FC<IProps> = (props) => {
  const { error, rowsPerPage } = useSelector(
    ({ healthFacilities, user }: ReduxState): SelectorState => {
      return {
        error: user.allVhts.error
          ? user.allVhts.message
          : healthFacilities.error,
        rowsPerPage: user.allUsers.rowsPerPage,
      };
    }
  );

  const dispatch = useDispatch();

  const classes = useStyles();

  const onSearchChange = useSearchChange({
    updateSearchText: props.updateSearchText,
  });

  const { users, sortData } = useData({
    data: props.data,
    searchText: props.searchText,
    sortUsers: props.sortUsers,
  });

  const healthFacilityOptions = useHealthFacilityOptions();

  const vhtOptions = useVHTOptions();

  const tableColumns = useTableColumns({
    users,
    healthFacilityOptions,
    vhtOptions,
    sortData,
  });

  const localization = useLocalization({
    loading: props.loading,
    loadingText: `Getting user data...`,
  });

  const onChangePage = useUpdatePageNumber({
    update: props.updatePageNumber,
  });

  const onChangeRowsPerPage = (numberOfRows: number): void => {
    dispatch(updateRowsPerPage(numberOfRows));
  };

  const clearMessage = (): void => {
    dispatch(clearAllVhtsRequestOutcome());
    dispatch(clearHealthFacilitiesRequestOutcome());
  };

  return (
    <>
      <Toast message={error} clearMessage={clearMessage} status="error" />
      <MUIDataTable
        columns={tableColumns}
        data={users}
        title="Users"
        options={{
          customRowRender: customRowRender({ rowClassName: classes.row }),
          customToolbar: customToolbarRender({
            loading: props.loading,
            searchText: props.searchText ?? ``,
            searchPlaceholder: `Search by any field`,
            updateSearchText: onSearchChange,
          }),
          download: false,
          elevation: 1,
          fixedHeader: true,
          filter: false,
          page: props.pageNumber,
          print: false,
          responsive: `simple`,
          rowsPerPage,
          selectableRows: `none`,
          search: false,
          textLabels: localization,
          viewColumns: false,
          onChangePage,
          onChangeRowsPerPage,
        }}
      />
    </>
  );
};
