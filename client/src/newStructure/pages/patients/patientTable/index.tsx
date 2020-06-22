import { Callback, GlobalSearchPatient, OrNull, OrUndefined, Patient } from '@types';
import MaterialTable, { MTableActions } from 'material-table';
import { initials, patientId, village, vitalSign } from '../../../shared/components/table/columns';

import { Action } from './action';
import React from 'react';
import debounce from 'lodash/debounce';
import { lastReadingDate } from './utils';
import { useActions } from './hooks/actions';
import { useData } from './hooks/data';
import { useStyles } from './styles';

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
  const classes = useStyles();

  const {
    debounceInterval,
    globalSearch,
    setGlobalSearch,
    patients,
    showReferredPatients,
    setShowReferredPatients,
  } = useData({ data, globalSearchData });
  
  const actions = useActions({ 
    globalSearch, 
    patientsExist: patients.length !== 0,
    showGlobalSearch, 
  });

  // Debounce get patients to prevent multiple server requests
  // Only send request after user has stopped typing for debounceInterval milliseconds
  const debouncedGetPatients = React.useCallback(
    debounce(getPatients, debounceInterval),
    [debounceInterval, getPatients]
  );

  return (
    <MaterialTable
      components={{
        Actions: props => (
          <div className={classes.actionsContainer}>
            <MTableActions {...props}/>
          </div>
        ),
        Action: props => (
          <Action 
            action={props.action.icon}
            data={props.data}
            globalSearch={globalSearch}
            showReferredPatients={showReferredPatients} 
            toggleGlobalSearch={setGlobalSearch} 
            toggleShowReferredPatients={setShowReferredPatients} 
            onGlobalSearchPatientSelected={onGlobalSearchPatientSelected}
          />
        )
      }}
      title="Patients"
      isLoading={ isLoading }
      columns={[
        initials,
        patientId,
        village,
        vitalSign,
        lastReadingDate,
      ]}
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
        actionsCellStyle: { minWidth: 100, padding: `0 1rem` },
        actionsColumnIndex: -1,
        debounceInterval,
        pageSize: 10,
        rowStyle: (): React.CSSProperties => ({
          height: 75,
        }),
        searchFieldVariant: `outlined`,
        searchFieldStyle: { marginBlockStart: `1rem` },
        sorting: true
      } }
      onRowClick={ globalSearch 
        ? undefined  
        : (_, patient: Patient) => onPatientSelected(patient) 
      }
      actions={actions}
    />
  );
};
