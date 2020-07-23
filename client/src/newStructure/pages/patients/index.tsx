import {
  Callback,
  GlobalSearchPatient,
  OrNull,
  OrUndefined,
  Patient,
} from '@types';
import { PatientStateEnum, RoleEnum } from '../../enums';
import {
  addPatientToHealthFacility,
  getPatients,
  getPatientsRequested,
  sortPatients,
  toggleGlobalSearch,
  toggleShowReferredPatients,
  updateGlobalSearchPageNumber,
  updatePatientsTableSearchText,
  updateSelectedPatientState,
} from '../../shared/reducers/patients';

import { PatientTable } from './patientTable';
import React from 'react';
import { ReduxState } from '../../redux/rootReducer';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

interface IProps {
  addingFromGlobalSearch: boolean;
  globalSearch: boolean;
  globalSearchPageNumber: number;
  patientsTableSearchText?: string;
  showReferredPatients?: boolean;
  fetchingPatients: boolean;
  patients: OrNull<Array<Patient>>;
  globalSearchPatients: OrNull<Array<GlobalSearchPatient>>;
  getPatients: (searchText?: string) => void;
  addPatientToHealthFacility: Callback<string>;
  sortPatients: Callback<OrNull<Array<Patient>>>;
  toggleGlobalSearch: Callback<boolean>;
  updateGlobalSearchPageNumber: Callback<number>;
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
      globalSearchPageNumber={props.globalSearchPageNumber}
      patientsTableSearchText={props.patientsTableSearchText}
      showReferredPatients={props.showReferredPatients}
      toggleGlobalSearch={props.toggleGlobalSearch}
      onPatientSelected={onPatientSelected}
      onGlobalSearchPatientSelected={onGlobalSearchPatientSelected}
      data={patients}
      globalSearchData={props.globalSearchPatients}
      isLoading={fetchingPatients || props.addingFromGlobalSearch}
      showGlobalSearch={props.userIsHealthWorker}
      getPatients={getPatients}
      updateGlobalSearchPageNumber={props.updateGlobalSearchPageNumber}
      updatePatientsTableSearchText={props.updatePatientsTableSearchText}
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
  globalSearchPageNumber: patients.globalSearchPageNumber,
  patientsTableSearchText: patients.patientsTableSearchText,
  globalSearchPatients: patients.globalSearchPatientsList,
  showReferredPatients: patients.showReferredPatients,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators(
    {
      addPatientToHealthFacility,
      toggleGlobalSearch,
      updateGlobalSearchPageNumber,
      updatePatientsTableSearchText,
      updateSelectedPatientState,
      toggleShowReferredPatients,
      sortPatients,
    },
    dispatch
  ),
  getPatients: (search?: string): void => {
    dispatch(getPatientsRequested());
    dispatch(getPatients(search));
  },
  navigateToPatientPage: (patientId: string) =>
    dispatch(push(`/patient/${patientId}`)),
});

export const PatientsPage = connect(mapStateToProps, mapDispatchToProps)(Page);
