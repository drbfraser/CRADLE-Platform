import {
  getPatients,
  getPatientsRequested,
} from '../../shared/reducers/patients';

import { PatientTable } from './patientTable';
import React from 'react';
import { connect } from 'react-redux';
import { Patient } from '@types';
import { push } from 'connected-react-router';
import { ReduxState } from '../../redux/rootReducer';

interface IProps {
  fetchingPatients: boolean;
  patients: Array<Patient>;
  getPatients: any;
  navigateToPatientPage: any;
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
    />
  );
};

const mapStateToProps = ({ patients }: ReduxState) => ({
  fetchingPatients: patients.isLoading,
  patients: patients.patientsList,
});

const mapDispatchToProps = (dispatch: any) => ({
  getPatients: () => {
    dispatch(getPatientsRequested());
    dispatch(getPatients());
  },
  navigateToPatientPage: (patientId: string) =>
    dispatch(push(`/patient/${patientId}`)),
});

export const PatientsPage = connect(mapStateToProps, mapDispatchToProps)(Page);
