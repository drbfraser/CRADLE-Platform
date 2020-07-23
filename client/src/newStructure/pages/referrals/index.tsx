import { Dispatch, bindActionCreators } from 'redux';
import { PatientsState, getPatients } from '../../shared/reducers/patients';
import React, { Component } from 'react';

import { ReduxState } from '../../redux/rootReducer';
import { ReferralTable } from './referralTable';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';

interface IProps {
  getCurrentUser: any;
  user: any;
  patients: PatientsState;
  getPatients: any;
  history: any;
}
class ReferralPageComponent extends Component<IProps> {
  state = {
    patientsList: [],
  };

  componentDidMount = () => {
    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser();
    }
    if (
      this.props.patients.patientsList?.length === 0 ||
      this.props.patients.patientsList === null
    ) {
      this.props.getPatients();
    }
  };

  static filterReferrals(patientsList: any) {
    const result = patientsList?.filter((patient: any) => {
      if (patient.readings.length === 0) {
        return false;
      }

      // check if patient has a referral
      for (let i = 0; i < patient.readings.length; i++) {
        if (patient.readings[i].referral != null) {
          return true;
        }
      }
      return false;
    });
    return result ? result : [];
  }

  static getDerivedStateFromProps(props: any, state: any) {
    const referredPatients: any = ReferralsPage.filterReferrals(
      props.patients.patientsList
    );
    const newState = {
      ...state,
      patientsList: referredPatients,
    };

    return newState;
  }

  patientCallback = (selectedPatient: any) => {
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

const mapStateToProps = ({ patients, user }: ReduxState) => ({
  patients,
  user: user.current.data,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      getPatients,
      getCurrentUser,
    },
    dispatch
  );
};

export const ReferralsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(ReferralPageComponent);
