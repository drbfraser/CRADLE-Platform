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
  getPatientsTablePatients,
  sortPatientsTablePatients,
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
  getPatientsTablePatients: (searchText?: string) => void;
  addPatientToHealthFacility: Callback<string>;
  sortPatientsTablePatients: Callback<
    OrNull<Array<Patient> | Array<GlobalSearchPatient>>
  >;
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
  getPatientsTablePatients,
  ...props
}) => {
  React.useEffect(() => {
    if (!fetchingPatients && patients === null) {
      getPatientsTablePatients();
    }
  }, [fetchingPatients, getPatientsTablePatients, patients]);

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
      getPatients={getPatientsTablePatients}
      updatePageNumber={props.updatePatientsTablePageNumber}
      updateSearchText={props.updatePatientsTableSearchText}
      updateSelectedPatientState={props.updateSelectedPatientState}
      toggleShowReferredPatients={props.toggleShowReferredPatients}
      sortPatients={props.sortPatientsTablePatients}
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
        getPatientsTablePatients,
        toggleGlobalSearch,
        updatePatientsTablePageNumber,
        updatePatientsTableSearchText,
        updateSelectedPatientState,
        toggleShowReferredPatients,
        sortPatientsTablePatients,
      },
      dispatch
    ),
    navigateToPatientPage: (patientId: string) =>
      dispatch(push(`/patients/${patientId}`)),
  };
};

export const PatientsPage = connect(mapStateToProps, mapDispatchToProps)(Page);
