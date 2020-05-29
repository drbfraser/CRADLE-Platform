// @ts-nocheck

import React from 'react'
import { connect } from 'react-redux'
import { getPatient, getPatientRequested } from '../../../reducers/patients'
import { getCurrentUser } from '../../../reducers/user/currentUser'
import { PatientSummary } from '..'
import { ReduxState } from 'src/newStructure/redux/rootReducer'

class Component extends React.Component {
  constructor(props) {
    super(props)
    // TO DO: don't fetch patientData everytime, get it from redux if possible.
    this.props.getPatient(this.props.match.params.id)
  }

  componentDidMount() {
    if (!this.props.loggedIn) {
      this.props.getCurrentUser()
    }
    this.props.getPatient(this.props.match.params.id)
  }

  backBtnCallback = () => {
    this.props.history.goBack()
  }

  render() {
    if (!this.props.loggedIn) {
      return <div />
    }

    if (this.props.isLoading) {
      return <div>Loading...</div>
    }

    return (
      <PatientSummary
        callbackFromParent={this.backBtnCallback}
        selectedPatient={this.props.patient}
      />
    )
  }
}

const mapStateToProps = ({ patients, user }: ReduxState) => ({
  isLoading: patients.isLoading,
  loggedIn: user.current.loggedIn,
  patient: patients.patient,
})

const mapDispatchToProps = dispatch => ({
  getPatient: patientId => {
    dispatch(getPatientRequested())
    dispatch(getPatient(patientId))
  },
  getCurrentUser: () => {
    dispatch(getCurrentUser())
  }
})

export const PatientSummaryContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
