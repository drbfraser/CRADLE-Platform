import { Callback, OrNull, OrUndefined, Patient } from '@types';
import { useDispatch, useSelector } from 'react-redux';

import MUIDataTable from 'mui-datatables';
import React from 'react';
import { ReduxState } from 'src/newStructure/redux/reducers';
import { customRowRender } from '../../../shared/components/table/row';
import { customToolbarRender } from '../../../shared/components/table/toolbar';
import { updateReferralsTableRowsPerPage } from '../../../redux/reducers/patients';
import { useData } from './hooks/data';
import { useLocalization } from '../../../shared/hooks/table/localization';
import { useSearchChange } from '../../../shared/hooks/table/searchChange';
import { useTableColumns } from './hooks/tableColumns';
import { useUpdatePageNumber } from '../../../shared/hooks/table/updatePageNumber';

interface IProps {
  data: OrNull<Array<Patient>>;
  pageNumber: number;
  loading: boolean;
  onPatientSelected: Callback<Patient>;
  sortPatients: Callback<OrNull<Array<Patient>>>;
  updatePageNumber: Callback<number>;
  updateSearchText: Callback<OrUndefined<string>>;
  searchText?: string;
}

export const ReferralTable: React.FC<IProps> = (props) => {
  const rowsPerPage = useSelector(({ patients }: ReduxState): number => {
    return patients.referralsTableRowsPerPage;
  });

  const onSearchChange = useSearchChange({
    updateSearchText: props.updateSearchText,
  });

  const { patients, sortData } = useData({
    data: props.data,
    searchText: props.searchText,
    sortPatients: props.sortPatients,
  });

  const tableColumns = useTableColumns({
    patients,
    sortData,
  });

  const localization = useLocalization({
    loading: props.loading,
    loadingText: `Getting referral data...`,
  });

  const onChangePage = useUpdatePageNumber({
    update: props.updatePageNumber,
  });

  const dispatch = useDispatch();

  const onChangeRowsPerPage = (numberOfRows: number): void => {
    dispatch(updateReferralsTableRowsPerPage(numberOfRows));
  };

  const handleRowClick = (dataIndex: number): void => {
    props.onPatientSelected(patients[dataIndex]);
  };

  return (
    <MUIDataTable
      columns={tableColumns}
      data={patients}
      title="Referrals"
      options={{
        customRowRender: customRowRender({ handleRowClick }),
        customToolbar: customToolbarRender({
          loading: props.loading,
          searchText: props.searchText ?? ``,
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
  );
};
