import {
  getPatient,
  getPatientRequested,
} from '../../../reducers/patients';

import PatientSummary from '..';
import React from 'react';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../../reducers/user/currentUser';

class PatientSummaryContainerComponent extends React.Component {
  constructor(props) {
    super(props);
    // TO DO: don't fetch patientData everytime, get it from redux if possible.
    this.props.getPatient(this.props.match.params.id);
  }

  componentDidMount() {
    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser();
    }
    this.props.getPatient(this.props.match.params.id);
  }

  backBtnCallback = () => {
    this.props.history.goBack();
  };

  render() {
    if (!this.props.user.isLoggedIn) {
      return <div />;
    }

    if (this.props.isLoading) {
      return <div>Loading...</div>;
    }

    return (
      <PatientSummary
        callbackFromParent={this.backBtnCallback}
        selectedPatient={this.props.patient}
      />
    );
  }
}

const mapStateToProps = ({ patients, user }) => ({
  patient: patients.patient,
  isLoading: patients.isLoading,
  user: user.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  getPatient: (patientId) => {
    dispatch(getPatientRequested());
    dispatch(getPatient(patientId));
  },
  getCurrentUser: () => dispatch(getCurrentUser()),
});

export const PatientSummaryContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PatientSummaryContainerComponent);
