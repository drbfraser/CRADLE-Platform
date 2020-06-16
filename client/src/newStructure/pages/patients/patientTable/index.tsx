import { Callback, GlobalSearchPatient, OrNull, OrUndefined, Patient } from '@types';
import { initials, lastReadingDate, patientId, village, vitalSign } from './utils';

import MaterialTable from 'material-table';
import React from 'react';
import debounce from 'lodash/debounce';
import { useActions } from './hooks/actions';
import { useData } from './hooks/data';

interface IProps {
  data: OrNull<Array<Patient>>;
  globalSearchData: OrNull<Array<GlobalSearchPatient>>;
  isLoading: boolean;
  callbackFromParent: Callback<Patient | GlobalSearchPatient>;
  getPatients: Callback<OrUndefined<string>>;
  showGlobalSearch?: boolean; 
}

export const PatientTable: React.FC<IProps> = ({
  callbackFromParent,
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
      columns={ [
        initials,
        patientId,
        village,
        vitalSign,
        lastReadingDate,
      ] }
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
        ? undefined 
        : (_, rowData: Patient | GlobalSearchPatient) => callbackFromParent(rowData) 
      }
      actions={actions}
    />
  );
};
