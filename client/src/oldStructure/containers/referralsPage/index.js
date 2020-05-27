import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getPatients, getPatientsRequested } from '../../actions/patients'
import { getCurrentUser } from '../../actions/users'
import PatientTable from './referralTable'
import PatientSummary from '../patientPage/patientSummary'

class ReferralPage extends Component {
  state = {
    patientsList: []
  }

  componentDidMount = () => {
    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser()
    }
    if (this.props.patients.patientsList.length === 0) {
      this.props.getPatients()
    }
  }

  static filterReferrals(patientsList) {
    const result = patientsList.filter(patient => {
      if (patient.readings.length === 0) {
        return false
      }

      // check if patient has a referral
      for (var i = 0; i < patient.readings.length; i++) {
        if (patient.readings[i].referral != null) {
          return true
        }
      }
      return false
    })
    return result
  }

  static getDerivedStateFromProps(props, state) {
    const referredPatients = ReferralPage.filterReferrals(
      props.patients.patientsList
    )
    let newState = {
      ...state,
      patientsList: referredPatients
    }

    return newState
  }

  patientCallback = selectedPatient => {
    this.props.history.push(`/patient/${selectedPatient.patientId}`)
  }

  backBtnCallback = () => {
    this.props.history.goBack()
  }

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />
    }

    return (
      <div>
        <PatientTable
          callbackFromParent={this.patientCallback}
          data={this.state.patientsList}
          isLoading={this.props.patients.isLoading}></PatientTable>
      </div>
    )
  }
}

const mapStateToProps = ({ patients, user }) => ({
  patients: patients,
  user: user.currentUser
})

const mapDispatchToProps = dispatch => ({
  getPatients: () => {
    dispatch(getPatientsRequested())
    dispatch(getPatients())
  },
  getCurrentUser: () => {
    dispatch(getCurrentUser())
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReferralPage)
