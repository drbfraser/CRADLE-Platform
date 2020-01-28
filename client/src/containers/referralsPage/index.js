import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getPatients } from '../../actions/patients'
import { getCurrentUser } from '../../actions/users'
import PatientTable from './referralTable'
import PatientSummary from '../patientPage/patientSummary'


class ReferralPage extends Component {
  state = {
    selectedPatient: { patientId: '', patientName: 'Test', 
                       patientSex: 'F', medicalHistory: '',
                       drugHistory: '', villageNumber:'', readings: []
                      },
    showSelectedPatient : false,
    patientsList: []
  }

  componentDidMount = () => {
    this.props.getCurrentUser().then((err) => {
      if (err !== undefined) {
        // error from getCurrentUser(), don't get patients
        return
      }
      
      if (this.props.patients.patientsList.length === 0) {
        this.props.getPatients()
      }
    })
  }

  filterReferrals = (patientsList) => {
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

  componentWillReceiveProps(props) {
    const referredPatients = this.filterReferrals(props.patients.patientsList)
    this.setState({ patientsList : referredPatients})
  }

  patientCallback = (selectedPatient) => {
    console.log('Received callback: ')
    this.setState({'selectedPatient': selectedPatient, 'showSelectedPatient': true })
  }

  backBtnCallback = (status) => {
    this.setState({ 'showSelectedPatient' : false })
  }


  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />
    }

    return (
      <div>
        {this.state.showSelectedPatient ? (
          <PatientSummary callbackFromParent={this.backBtnCallback} selectedPatient={this.state.selectedPatient}></PatientSummary>
        ) : (
          <PatientTable callbackFromParent={this.patientCallback} data={this.state.patientsList} isLoading={this.props.patients.isLoading}></PatientTable>
        )}
      </div>
    )
  }
}

const mapStateToProps = ({ patients, user }) => ({
  patients : patients,
  user : user.currentUser
})

const mapDispatchToProps = dispatch => ({
  getPatients: () => {
    dispatch(getPatients())
  },
  ...bindActionCreators(
    {
      getCurrentUser,
    },
    dispatch
  )
})
  

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReferralPage)
