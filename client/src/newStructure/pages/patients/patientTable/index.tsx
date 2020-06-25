import {
  Callback,
  GlobalSearchPatient,
  OrNull,
  OrUndefined,
  Patient,
} from '@types';
import {
  initials,
  patientId,
  village,
  vitalSign,
} from '../../../shared/components/table/columns';
import { lastReadingDate, options } from './utils';

import { Action } from './action';
import { Actions } from './components/actions';
import MaterialTable from 'material-table';
import React from 'react';
import { useActions } from './hooks/actions';
import { useData } from './hooks/data';
import { useLocalization } from './hooks/localization';
import { useSearchChange } from './hooks/search/change';
import { useSearchFocus } from './hooks/search/focus';
import { useUpdatePageNumber } from './hooks/updatePageNumber';

interface IProps {
  data: OrNull<Array<Patient>>;
  globalSearchData: OrNull<Array<GlobalSearchPatient>>;
  globalSearch: boolean;
  globalSearchPageNumber: number;
  isLoading: boolean;
  getPatients: Callback<OrUndefined<string>>;
  onPatientSelected: Callback<Patient>;
  onGlobalSearchPatientSelected: Callback<GlobalSearchPatient>;
  toggleGlobalSearch: Callback<boolean>;
  updateGlobalSearchPageNumber: Callback<number>;
  showGlobalSearch?: boolean;
}

export const PatientTable: React.FC<IProps> = (props) => {
  const {
    debounceInterval,
    patients,
    showReferredPatients,
    setShowReferredPatients,
  } = useData({
    data: props.data,
    globalSearch: props.globalSearch,
    globalSearchData: props.globalSearchData,
  });

  const actions = useActions({
    globalSearch: props.globalSearch,
    patientsExist: patients.length !== 0,
    showGlobalSearch: props.showGlobalSearch,
  });

  const localization = useLocalization(props.globalSearch);

  const onSearchChange = useSearchChange({
    debounceInterval,
    globalSearch: props.globalSearch,
    getPatients: props.getPatients,
  });

  useSearchFocus(props.globalSearch);

  const onChangePage = useUpdatePageNumber({
    globalSearch: props.globalSearch,
    update: props.updateGlobalSearchPageNumber,
  });

  const handleRowClick = (_: any, patient: Patient): void => {
    props.onPatientSelected(patient);
  };

  return (
    <MaterialTable
      components={{
        Actions: (actionsProps) => <Actions {...actionsProps} />,
        Action: ({ action, data }) => (
          <Action
            action={action.icon}
            data={data}
            globalSearch={props.globalSearch}
            showReferredPatients={showReferredPatients}
            toggleGlobalSearch={props.toggleGlobalSearch}
            toggleShowReferredPatients={setShowReferredPatients}
            onGlobalSearchPatientSelected={props.onGlobalSearchPatientSelected}
          />
        ),
      }}
      localization={localization}
      title="Patients"
      isLoading={props.isLoading}
      columns={[initials, patientId, village, vitalSign, lastReadingDate]}
      data={patients}
      onChangePage={onChangePage}
      onSearchChange={onSearchChange}
      options={options({
        debounceInterval,
        globalSearch: props.globalSearch,
        globalSearchPageNumber: props.globalSearchPageNumber,
      })}
      onRowClick={handleRowClick}
      actions={actions}
    />
  );
};
