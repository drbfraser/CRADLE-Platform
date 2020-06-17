import { Callback, GlobalSearchPatient, OrNull, OrUndefined, Patient } from '@types';
import MaterialTable, { Column } from 'material-table';
import { initials, lastReadingDate, patientId, state, village, vitalSign } from './utils';

import React from 'react';
import debounce from 'lodash/debounce';
import { useActions } from './hooks/actions';
import { useData } from './hooks/data';

interface IProps {
  data: OrNull<Array<Patient>>;
  globalSearchData: OrNull<Array<GlobalSearchPatient>>;
  isLoading: boolean;
  onPatientSelected: Callback<Patient>;
  onGlobalSearchPatientSelected: Callback<GlobalSearchPatient>;
  getPatients: Callback<OrUndefined<string>>;
  showGlobalSearch?: boolean; 
}

export const PatientTable: React.FC<IProps> = ({
  onPatientSelected,
  onGlobalSearchPatientSelected,
  data,
  globalSearchData,
  isLoading,
  getPatients,
  showGlobalSearch,
}) => {
  const {
    debounceInterval,
    globalSearch,
    setGlobalSearch,
    patients,
    showReferredPatients,
    setShowReferredPatients,
  } = useData({ data, globalSearchData });
  
  const { actions, setSearching } = useActions({
    showReferredPatients,
    toggleGlobalSearch: setGlobalSearch,
    toggleShowReferredPatients: setShowReferredPatients,
    usingGlobalSearch: globalSearch,
    showGlobalSearchAction: showGlobalSearch,
  });

  const columns = React.useMemo<Array<Column<Patient | GlobalSearchPatient>>>(() => {
    const allColumns = [
      initials,
      patientId,
      village,
      vitalSign,
      lastReadingDate,
    ];

    if (globalSearch) {
      allColumns.push(state);
    }

    return allColumns;
  }, [globalSearch]);

  React.useEffect((): void => {
    if (globalSearch && isLoading) {
      setSearching(true);
    }
  }, [globalSearch, isLoading, setSearching]);

  // Debounce get patients to prevent multiple server requests
  // Only send request after user has stopped typing for debounceInterval milliseconds
  const debouncedGetPatients = React.useCallback(
    debounce(getPatients, debounceInterval),
    [debounceInterval, getPatients]
  );

  return (
    <MaterialTable
      title="Patients"
      isLoading={ isLoading }
      columns={columns}
      data={patients}
      onSearchChange={globalSearch 
        ? (searchText?: string): void => {
          if (searchText) {
            debouncedGetPatients(searchText);
          }
        }
        : undefined
      }
      options={ {
        actionsCellStyle: { padding: `0 1rem` },
        actionsColumnIndex: -1,
        debounceInterval,
        pageSize: 10,
        rowStyle: (): React.CSSProperties => ({
          height: 75
        }),
        sorting: true
      } }
      onRowClick={ globalSearch 
        ? (_, rowData: GlobalSearchPatient) => onGlobalSearchPatientSelected(rowData)  
        : (_, rowData: Patient) => onPatientSelected(rowData) 
      }
      actions={actions}
    />
  );
};
