import {
  getPatients,
  getPatientsRequested,
} from '../../shared/reducers/patients';

import { Patient } from '@types';
import { PatientTable } from './patientTable';
import React from 'react';
import { ReduxState } from '../../redux/rootReducer';
import { RoleEnum } from '../../enums';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

interface IProps {
  fetchingPatients: boolean;
  patients: Array<Patient>;
  getPatients: any;
  navigateToPatientPage: any;
  userIsHealthWorker?: boolean; 
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
    />
  );
};

const mapStateToProps = ({ patients, user }: ReduxState) => ({
  userIsHealthWorker: user.current.data?.roles.includes(RoleEnum.HCW),
  fetchingPatients: patients.isLoading,
  patients: patients.patientsList,
});

const mapDispatchToProps = (dispatch: any) => ({
  getPatients: () => {
    dispatch(getPatientsRequested());
    dispatch(getPatients());
  },
  navigateToPatientPage: (patientId: string) => dispatch(
    push(`/patient/${patientId}`)
  )
});

export const PatientsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Page);
