import React, { Component } from 'react';
import {
  getPatients,
  getPatientsRequested,
} from '../../shared/reducers/patients';

import { PatientTable } from './patientTable';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../shared/reducers/user';

class PatientPageComponent extends Component {
  state = {
    selectedPatient: {
      patientId: ``,
      patientName: `Test`,
      patientSex: `F`,
      medicalHistory: ``,
      drugHistory: ``,
      villageNumber: ``,
      readings: [],
    },
  };

  componentDidMount = () => {
    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser();
    }
    if (
      !this.props.patients.patientsList ||
      this.props.patients.patientsList.length === 0
    ) {
      this.props.getPatients();
    }
  };

  patientCallback = (selectedPatient) => {
    console.log(`Received callback: `);
    this.props.history.push(`/patient/${selectedPatient.patientId}`);
  };

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />;
    }

    return (
      <div>
        <PatientTable
          callbackFromParent={this.patientCallback}
          data={this.props.patients.patientsList}
          isLoading={this.props.patients.isLoading}></PatientTable>
      </div>
    );
  }
}

const mapStateToProps = ({ patients, user }) => ({
  patients: patients,
  user: user.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  getPatients: () => {
    dispatch(getPatientsRequested());
    dispatch(getPatients());
  },
  getCurrentUser: () => {
    dispatch(getCurrentUser());
  },
});

export const PatientPage = connect(mapStateToProps, mapDispatchToProps)(PatientPageComponent);
