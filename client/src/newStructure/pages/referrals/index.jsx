import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  getPatients,
  getPatientsRequested
} from '../../shared/reducers/patients';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';
import { ReferralTable } from './referralTable';

class ReferralPage extends Component {
  state = {
    patientsList: []
  };

  componentDidMount = () => {
    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser();
    }
    if (this.props.patients.patientsList.length === 0) {
      this.props.getPatients();
    }
  };

  static filterReferrals(patientsList) {
    const result = patientsList.filter(patient => {
      if (patient.readings.length === 0) {
        return false;
      }

      // check if patient has a referral
      for (var i = 0; i < patient.readings.length; i++) {
        if (patient.readings[i].referral != null) {
          return true;
        }
      }
      return false;
    });
    return result;
  }

  static getDerivedStateFromProps(props, state) {
    const referredPatients = ReferralPage.filterReferrals(
      props.patients.patientsList
    );
    let newState = {
      ...state,
      patientsList: referredPatients
    };

    return newState;
  }

  patientCallback = selectedPatient => {
    console.log('Received callback: ');
    this.props.history.push(`/patient/${selectedPatient.patientId}`);
  };

  backBtnCallback = () => {
    this.props.history.goBack();
  };

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />;
    }

    return (
      <div>
        <ReferralTable
          callbackFromParent={this.patientCallback}
          data={this.state.patientsList}
          isLoading={this.props.patients.isLoading}></ReferralTable>
      </div>
    );
  }
}

const mapStateToProps = ({ patients, user }) => ({
  patients: patients,
  user: user.currentUser
});

const mapDispatchToProps = dispatch => ({
  getPatients: () => {
    dispatch(getPatientsRequested());
    dispatch(getPatients());
  },
  getCurrentUser: () => {
    dispatch(getCurrentUser());
  }
});

export const ReferralsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(ReferralPage);
