import { Callback, OrNull, OrUndefined, Patient } from '@types';
import { initials, lastReadingDate, patientId, village, vitalSign } from './utils';

import MaterialTable from 'material-table';
import React from 'react';
import debounce from 'lodash/debounce';
import { useActions } from './hooks/actions';
import { useData } from './hooks/data';

interface IProps {
  data: OrNull<Array<Patient>>;
  isLoading: boolean;
  callbackFromParent: Callback<Patient>;
  getPatients: Callback<OrUndefined<string>>;
  resetToPatientsBeforeSearch: Callback<Array<Patient>>;
  showGlobalSearch?: boolean; 
}

export const PatientTable: React.FC<IProps> = ({
  callbackFromParent,
  data,
  isLoading,
  getPatients,
  resetToPatientsBeforeSearch,
  showGlobalSearch,
}) => {
  const {
    debounceInterval,
    globalSearch,
    setGlobalSearch,
    patients,
    patientsBeforeSearch,
    setPatientsBeforeSearch,
    showReferredPatients,
    setShowReferredPatients,
  } = useData({ data, resetToPatientsBeforeSearch });
  
  const actions = useActions({
    showReferredPatients,
    toggleGlobalSearch: setGlobalSearch,
    toggleShowReferredPatients: setShowReferredPatients,
    usingGlobalSearch: globalSearch,
    showGlobalSearchAction: showGlobalSearch,
  });

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
          if (!searchText) {
            return;
          }
          
          // Update patientsBeforeSearch to current patients
          // Useful to reset patients to before global search state
          if (!patientsBeforeSearch) {
            setPatientsBeforeSearch(patients);
          }
          
          debouncedGetPatients(searchText);
        }
        : undefined
      }
      options={ {
        debounceInterval,
        pageSize: 10,
        rowStyle: (): React.CSSProperties => ({
          height: 75
        }),
        sorting: true
      } }
      onRowClick={ (_, rowData: Patient) => callbackFromParent(rowData) }
      actions={actions}
    />
  );
};
