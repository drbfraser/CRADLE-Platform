import { Callback, Patient } from '@types';
import {
  getPatients,
  getPatientsRequested,
  resetToPatientsBeforeSearch,
} from '../../shared/reducers/patients';

import { PatientTable } from './patientTable';
import React from 'react';
import { ReduxState } from '../../redux/rootReducer';
import { RoleEnum } from '../../enums';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

interface IProps {
  fetchingPatients: boolean;
  patients: Array<Patient>;
  getPatients: (search?: string) => void,
  navigateToPatientPage: any;
  userIsHealthWorker?: boolean; 
  resetToPatientsBeforeSearch: Callback<Array<Patient>>;
}

const Page: React.FC<IProps> = (props) => {
  React.useEffect(() => {
    if (!props.fetchingPatients && props.patients === null) {
      props.getPatients();
    }
  }, [props.fetchingPatients, props.getPatients, props.patients]);

  const onPatientSelected = ({ patientId }: Patient): void => 
    props.navigateToPatientPage(patientId);

  return (
    <PatientTable
      callbackFromParent={onPatientSelected}
      data={props.patients}
      isLoading={props.fetchingPatients}
      showGlobalSearch={props.userIsHealthWorker}
      getPatients={props.getPatients}
      resetToPatientsBeforeSearch={props.resetToPatientsBeforeSearch}
    />
  );
};

const mapStateToProps = ({ patients, user }: ReduxState) => ({
  userIsHealthWorker: user.current.data?.roles.includes(RoleEnum.HCW),
  fetchingPatients: patients.isLoading,
  patients: patients.patientsList,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators({
    resetToPatientsBeforeSearch
  }, dispatch),
  getPatients: (search?: string): void => {
    dispatch(getPatientsRequested());
    dispatch(getPatients(search));
  },
  navigateToPatientPage: (patientId: string) => dispatch(
    push(`/patient/${patientId}`)
  )
});

export const PatientsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
