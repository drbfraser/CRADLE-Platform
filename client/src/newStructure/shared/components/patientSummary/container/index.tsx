import {
  getPatient,
  getPatientRequested,
} from '../../../reducers/patients';

import { PatientSummary } from '..';
import React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import { bindActionCreators } from 'redux';
import { getCurrentUser } from '../../../reducers/user/currentUser';

interface IProps {
  getCurrentUser: any;
  getPatient: any;
  history: any;
  isLoading: boolean;
  loggedIn: boolean;
  match: any;
  patient: any;
}

class Component extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
    // TO DO: don't fetch patientData everytime, get it from redux if possible.
    this.props.getPatient(this.props.match.params.id);
  }

  componentDidMount() {
    if (!this.props.loggedIn) {
      this.props.getCurrentUser();
    }
    this.props.getPatient(this.props.match.params.id);
  }

  backBtnCallback = (): void => this.props.history.goBack();

  render() {
    if (!this.props.loggedIn) {
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

const mapStateToProps = ({ patients, user }: ReduxState) => ({
  patient: patients.patient,
  isLoading: patients.isLoading,
  loggedIn: user.current.loggedIn,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators({ getCurrentUser }, dispatch),
  getPatient: (patientId: any) => {
    dispatch(getPatientRequested());
    dispatch(getPatient(patientId));
  },
});

export const PatientSummaryContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);