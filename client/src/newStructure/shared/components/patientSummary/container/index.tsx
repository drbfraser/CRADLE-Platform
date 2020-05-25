import {
  getPatient,
  getPatientRequested,
} from '../../../reducers/patients';

import { PatientSummary } from '..';
import React from 'react';
import { connect } from 'react-redux';

interface IProps {
  getPatient: any;
  history: any;
  isLoading: boolean;
  match: any;
  patient: any;
  user: any;
}

const Component: React.FC<IProps> = (props) => {
  React.useEffect((): void => {
    // TODO: don't fetch patientData everytime, get it from redux if possible.
    props.getPatient(props.match.params.id);
  }, [props.getPatient, props.match.params.id]);

  const backBtnCallback = (): void => props.history.goBack();

  if (props.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <PatientSummary
      callbackFromParent={backBtnCallback}
      selectedPatient={props.patient}
    />
  );
}

const mapStateToProps = ({ patients, user }: any) => ({
  patient: patients.patient,
  isLoading: patients.isLoading,
  user: user.currentUser,
});

const mapDispatchToProps = (dispatch: any) => ({
  getPatient: (patientId: any) => {
    dispatch(getPatientRequested());
    dispatch(getPatient(patientId));
  },
});

export const PatientSummaryContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);