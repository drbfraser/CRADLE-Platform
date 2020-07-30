import {
  Callback,
  GlobalSearchPatient,
  OrNull,
  OrUndefined,
  Patient,
} from '@types';
import { useDispatch, useSelector } from 'react-redux';

import MUIDataTable from 'mui-datatables';
import React from 'react';
import { ReduxState } from '../../../redux/reducers';
import { customRowRender } from '../../../shared/components/tableRow';
import { customToolbarRender } from './toolbar';
import { updateSelectedPatientState } from '../../../redux/reducers/patients';
import { useData } from './hooks/data';
import { useLocalization } from '../../../shared/hooks/table/localization';
import { useSearchChange } from '../../../shared/hooks/table/searchChange';
import { useTableColumns } from './hooks/tableColumns';
import { useUpdatePageNumber } from '../../../shared/hooks/table/updatePageNumber';

interface IProps {
  data: OrNull<Array<Patient>>;
  globalSearchData: OrNull<Array<GlobalSearchPatient>>;
  pageNumber: number;
  loading: boolean;
  getPatients: Callback<OrUndefined<string>>;
  onPatientSelected: Callback<Patient>;
  onGlobalSearchPatientSelected: Callback<string>;
  updatePageNumber: Callback<number>;
  updateSearchText: Callback<OrUndefined<string>>;
  searchText?: string;
  showReferredPatients?: boolean;
  showGlobalSearch?: boolean;
}

type SelectorState = {
  globalSearch: boolean;
};

export const PatientTable: React.FC<IProps> = (props) => {
  const { globalSearch } = useSelector(
    ({ patients }: ReduxState): SelectorState => {
      return {
        globalSearch: patients.globalSearch,
      };
    }
  );

  const dispatch = useDispatch();

  const onSearchChange = useSearchChange({
    updateSearchText: props.updateSearchText,
  });

  const { patients, sortData } = useData({
    data: props.data,
    globalSearch,
    globalSearchData: props.globalSearchData,
    searchText: props.searchText,
    getPatients: props.getPatients,
    showReferredPatients: props.showReferredPatients,
  });

  const tableColumns = useTableColumns({
    globalSearch,
    onGlobalSearchPatientSelected: props.onGlobalSearchPatientSelected,
    patients,
    sortData,
  });

  const localization = useLocalization({
    globalSearch,
    loading: props.loading,
    searchText: props.searchText,
  });

  const onChangePage = useUpdatePageNumber({
    update: props.updatePageNumber,
  });

  const handleRowClick = (dataIndex: number): void => {
    dispatch(
      updateSelectedPatientState(
        globalSearch
          ? (patients[dataIndex] as GlobalSearchPatient).state
          : undefined
      )
    );
    props.onPatientSelected(patients[dataIndex] as Patient);
  };

  return (
    <MUIDataTable
      columns={tableColumns}
      data={patients}
      title="Patients"
      options={{
        customRowRender: customRowRender(handleRowClick),
        customToolbar: customToolbarRender({
          globalSearch,
          globalSearchAction: props.showGlobalSearch,
          loading: props.loading,
          searchText: props.searchText ?? ``,
          showReferredPatients: props.showReferredPatients,
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
