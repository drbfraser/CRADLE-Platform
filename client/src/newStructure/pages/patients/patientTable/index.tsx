import {
  Callback,
  GlobalSearchPatient,
  OrNull,
  OrUndefined,
  Patient,
} from '@types';

import MUIDataTable from 'mui-datatables';
import { PatientStateEnum } from '../../../enums';
import React from 'react';
import { customRowRender } from '../../../shared/components/tableRow';
import { customToolbarRender } from './toolbar';
import { useData } from './hooks/data';
import { useLocalization } from '../../../shared/hooks/table/localization';
import { useSearchChange } from '../../../shared/hooks/table/searchChange';
import { useTableColumns } from './hooks/tableColumns';
import { useUpdatePageNumber } from '../../../shared/hooks/table/updatePageNumber';

interface IProps {
  data: OrNull<Array<Patient>>;
  globalSearchData: OrNull<Array<GlobalSearchPatient>>;
  globalSearch: boolean;
  pageNumber: number;
  loading: boolean;
  getPatients: Callback<OrUndefined<string>>;
  onPatientSelected: Callback<Patient>;
  onGlobalSearchPatientSelected: Callback<string>;
  toggleGlobalSearch: Callback<boolean>;
  sortPatients: Callback<OrNull<Array<Patient> | Array<GlobalSearchPatient>>>;
  updateSelectedPatientState: Callback<OrUndefined<PatientStateEnum>>;
  updatePageNumber: Callback<number>;
  updateSearchText: Callback<OrUndefined<string>>;
  toggleShowReferredPatients: () => void;
  searchText?: string;
  showReferredPatients?: boolean;
  showGlobalSearch?: boolean;
}

export const PatientTable: React.FC<IProps> = (props) => {
  const onSearchChange = useSearchChange({
    updateSearchText: props.updateSearchText,
  });

  const { patients, sortData } = useData({
    data: props.data,
    globalSearch: props.globalSearch,
    globalSearchData: props.globalSearchData,
    searchText: props.searchText,
    getPatients: props.getPatients,
    showReferredPatients: props.showReferredPatients,
    sortPatients: props.sortPatients,
  });

  const tableColumns = useTableColumns({
    globalSearch: props.globalSearch,
    onGlobalSearchPatientSelected: props.onGlobalSearchPatientSelected,
    patients,
    sortData,
  });

  const localization = useLocalization({
    globalSearch: props.globalSearch,
    loading: props.loading,
  });

  const onChangePage = useUpdatePageNumber({
    update: props.updatePageNumber,
  });

  const handleRowClick = (dataIndex: number): void => {
    props.updateSelectedPatientState(
      props.globalSearch
        ? (patients[dataIndex] as GlobalSearchPatient).state
        : undefined
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
          globalSearch: props.globalSearch,
          globalSearchAction: props.showGlobalSearch,
          loading: props.loading,
          searchText: props.searchText ?? ``,
          showReferredPatients: props.showReferredPatients,
          toggleShowReferredPatients: props.toggleShowReferredPatients,
          updateSearchText: onSearchChange,
          toggleGlobalSearch: props.toggleGlobalSearch,
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
