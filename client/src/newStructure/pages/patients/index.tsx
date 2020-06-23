import { GlobalSearchPatient, OrNull, Patient } from '@types';
import { PatientStateEnum, RoleEnum } from '../../enums';
import {
  addPatientToHealthFacility,
  addPatientToHealthFacilityRequested,
  getPatients,
  getPatientsRequested,
  toggleGlobalSearch,
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
  fetchingPatients: boolean;
  patients: OrNull<Array<Patient>>;
  globalSearchPatients: OrNull<Array<GlobalSearchPatient>>;
  getPatients: (search?: string) => void;
  addPatientToHealthFacility: (patient: GlobalSearchPatient) => void;
  toggleGlobalSearch: (globalSearch: boolean) => void;
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

  const onGlobalSearchPatientSelected = (
    patient: GlobalSearchPatient
  ): void => {
    if (patient.state !== PatientStateEnum.ADD) {
      alert(`Patient already added!`);
    } else {
      props.addPatientToHealthFacility(patient);
    }
  };

  return (
    <PatientTable
      globalSearch={props.globalSearch}
      toggleGlobalSearch={props.toggleGlobalSearch}
      onPatientSelected={onPatientSelected}
      onGlobalSearchPatientSelected={onGlobalSearchPatientSelected}
      data={patients}
      globalSearchData={props.globalSearchPatients}
      isLoading={fetchingPatients || props.addingFromGlobalSearch}
      showGlobalSearch={props.userIsHealthWorker}
      getPatients={getPatients}
    />
  );
};

const mapStateToProps = ({ patients, user }: ReduxState) => ({
  addingFromGlobalSearch: patients.addingFromGlobalSearch,
  userIsHealthWorker: user.current.data?.roles.includes(RoleEnum.HCW),
  fetchingPatients: patients.isLoading,
  patients: patients.patientsList,
  globalSearch: patients.globalSearch,
  globalSearchPatients: patients.globalSearchPatientsList,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators({ toggleGlobalSearch }, dispatch),
  getPatients: (search?: string): void => {
    dispatch(getPatientsRequested());
    dispatch(getPatients(search));
  },
  addPatientToHealthFacility: (patient: GlobalSearchPatient): void => {
    dispatch(addPatientToHealthFacilityRequested(patient));
    dispatch(addPatientToHealthFacility(patient));
  },
  navigateToPatientPage: (patientId: string) =>
    dispatch(push(`/patient/${patientId}`)),
});

export const PatientsPage = connect(mapStateToProps, mapDispatchToProps)(Page);
