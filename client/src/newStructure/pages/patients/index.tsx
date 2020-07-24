import {
  Callback,
  GlobalSearchPatient,
  OrNull,
  OrUndefined,
  Patient,
} from '@types';
import { Dispatch, bindActionCreators } from 'redux';
import { PatientStateEnum, RoleEnum } from '../../enums';
import {
  addPatientToHealthFacility,
  getPatients,
  sortPatients,
  toggleGlobalSearch,
  toggleShowReferredPatients,
  updatePatientsTablePageNumber,
  updatePatientsTableSearchText,
  updateSelectedPatientState,
} from '../../shared/reducers/patients';

import { PatientTable } from './patientTable';
import React from 'react';
import { ReduxState } from '../../redux/rootReducer';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

interface IProps {
  addingFromGlobalSearch: boolean;
  globalSearch: boolean;
  pageNumber: number;
  patientsTableSearchText?: string;
  showReferredPatients?: boolean;
  fetchingPatients: boolean;
  patients: OrNull<Array<Patient>>;
  globalSearchPatients: OrNull<Array<GlobalSearchPatient>>;
  getPatients: (searchText?: string) => void;
  addPatientToHealthFacility: Callback<string>;
  sortPatients: Callback<OrNull<Array<Patient>>>;
  toggleGlobalSearch: Callback<boolean>;
  updatePatientsTablePageNumber: Callback<number>;
  updatePatientsTableSearchText: Callback<OrUndefined<string>>;
  updateSelectedPatientState: Callback<OrUndefined<PatientStateEnum>>;
  toggleShowReferredPatients: () => void;
  navigateToPatientPage: any;
  userIsHealthWorker?: boolean;
}

const Page: React.FC<IProps> = ({
  fetchingPatients,
  patients,
  getPatients,
  ...props
}) => {
  React.useEffect(() => {
    if (!fetchingPatients && patients === null) {
      getPatients();
    }
  }, [fetchingPatients, getPatients, patients]);

  const onPatientSelected = ({ patientId }: Patient): void =>
    props.navigateToPatientPage(patientId);

  const onGlobalSearchPatientSelected = (patientId: string): void => {
    props.addPatientToHealthFacility(patientId);
  };

  return (
    <PatientTable
      globalSearch={props.globalSearch}
      pageNumber={props.pageNumber}
      searchText={props.patientsTableSearchText}
      showReferredPatients={props.showReferredPatients}
      toggleGlobalSearch={props.toggleGlobalSearch}
      onPatientSelected={onPatientSelected}
      onGlobalSearchPatientSelected={onGlobalSearchPatientSelected}
      data={patients}
      globalSearchData={props.globalSearchPatients}
      loading={fetchingPatients || props.addingFromGlobalSearch}
      showGlobalSearch={props.userIsHealthWorker}
      getPatients={getPatients}
      updatePageNumber={props.updatePatientsTablePageNumber}
      updateSearchText={props.updatePatientsTableSearchText}
      updateSelectedPatientState={props.updateSelectedPatientState}
      toggleShowReferredPatients={props.toggleShowReferredPatients}
      sortPatients={props.sortPatients}
    />
  );
};

const mapStateToProps = ({ patients, user }: ReduxState) => ({
  addingFromGlobalSearch: patients.addingFromGlobalSearch,
  userIsHealthWorker: user.current.data?.roles.includes(RoleEnum.HCW),
  fetchingPatients: patients.isLoading,
  patients: patients.patientsList,
  globalSearch: patients.globalSearch,
  pageNumber: patients.patientsTablePageNumber,
  patientsTableSearchText: patients.patientsTableSearchText,
  globalSearchPatients: patients.globalSearchPatientsList,
  showReferredPatients: patients.showReferredPatients,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    ...bindActionCreators(
      {
        addPatientToHealthFacility,
        getPatients,
        toggleGlobalSearch,
        updatePatientsTablePageNumber,
        updatePatientsTableSearchText,
        updateSelectedPatientState,
        toggleShowReferredPatients,
        sortPatients,
      },
      dispatch
    ),
    navigateToPatientPage: (patientId: string) =>
      dispatch(push(`/patient/${patientId}`)),
  };
};

export const PatientsPage = connect(mapStateToProps, mapDispatchToProps)(Page);
