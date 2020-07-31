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
import { customRowRender } from './row';
import { customToolbarRender } from './toolbar';
import { useData } from './hooks/data';
import { useLocalization } from './hooks/localization';
import { useSearchChange } from './hooks/searchChange';
import { useTableColumns } from './hooks/tableColumns';
import { useUpdatePageNumber } from './hooks/updatePageNumber';

interface IProps {
  data: OrNull<Array<Patient>>;
  globalSearchData: OrNull<Array<GlobalSearchPatient>>;
  globalSearch: boolean;
  globalSearchPageNumber: number;
  isLoading: boolean;
  getPatients: Callback<OrUndefined<string>>;
  onPatientSelected: Callback<Patient>;
  onGlobalSearchPatientSelected: Callback<string>;
  toggleGlobalSearch: Callback<boolean>;
  sortPatients: Callback<OrNull<Array<Patient>>>;
  updateSelectedPatientState: Callback<OrUndefined<PatientStateEnum>>;
  updateGlobalSearchPageNumber: Callback<number>;
  updatePatientsTableSearchText: Callback<OrUndefined<string>>;
  toggleShowReferredPatients: () => void;
  patientsTableSearchText?: string;
  showReferredPatients?: boolean;
  showGlobalSearch?: boolean;
}

export const PatientTable: React.FC<IProps> = (props) => {
  const onSearchChange = useSearchChange({
    updateSearchText: props.updatePatientsTableSearchText,
  });

  const { patients, sortData } = useData({
    data: props.data,
    globalSearch: props.globalSearch,
    globalSearchData: props.globalSearchData,
    searchText: props.patientsTableSearchText,
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
    loading: props.isLoading,
    globalSearchMessage: props.patientsTableSearchText,
  });

  const onChangePage = useUpdatePageNumber({
    update: props.updateGlobalSearchPageNumber,
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
          loading: props.isLoading,
          searchText: props.patientsTableSearchText ?? ``,
          showReferredPatients: props.showReferredPatients,
          toggleShowReferredPatients: props.toggleShowReferredPatients,
          updateSearchText: onSearchChange,
          toggleGlobalSearch: props.toggleGlobalSearch,
        }),
        download: false,
        elevation: 1,
        fixedHeader: true,
        filter: false,
        page: props.globalSearchPageNumber,
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
