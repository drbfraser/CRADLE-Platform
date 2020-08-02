import { Callback, OrNull, OrUndefined, User } from '@types';

import MUIDataTable from 'mui-datatables';
import React from 'react';
import { customRowRender } from './tableRow';
import { customToolbarRender } from '../../../shared/components/table/toolbar';
import { useData } from './hooks/data';
import { useLocalization } from '../../../shared/hooks/table/localization';
import { useSearchChange } from '../../../shared/hooks/table/searchChange';
import { useStyles } from './styles';
import { useTableColumns } from './hooks/tableColumns';
import { useUpdatePageNumber } from '../../../shared/hooks/table/updatePageNumber';

interface IProps {
  data: OrNull<Array<User>>;
  pageNumber: number;
  loading: boolean;
  sortUsers: Callback<OrNull<Array<User>>>;
  updatePageNumber: Callback<number>;
  updateSearchText: Callback<OrUndefined<string>>;
  searchText?: string;
}

export const AdminTable: React.FC<IProps> = (props) => {
  const classes = useStyles();

  const onSearchChange = useSearchChange({
    capitalize: false,
    updateSearchText: props.updateSearchText,
  });

  const { users, sortData } = useData({
    data: props.data,
    searchText: props.searchText,
    sortUsers: props.sortUsers,
  });

  const tableColumns = useTableColumns({
    users,
    sortData,
  });

  const localization = useLocalization({
    loading: props.loading,
    loadingText: `Getting user data...`,
  });

  const onChangePage = useUpdatePageNumber({
    update: props.updatePageNumber,
  });

  return (
    <MUIDataTable
      columns={tableColumns}
      data={users}
      title="Manage Users"
      options={{
        customRowRender: customRowRender(classes.row),
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
        selectableRows: `none`,
        search: false,
        textLabels: localization,
        viewColumns: false,
        onChangePage,
      }}
    />
  );
};
