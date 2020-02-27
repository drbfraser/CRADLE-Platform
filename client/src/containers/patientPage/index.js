import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getPatients, getPatient } from '../../actions/patients'
import { getCurrentUser } from '../../actions/users'
import PatientTable from './patientTable'
import PatientSummary from './patientSummary'


class PatientPage extends Component {
  state = {
    rawPatient: {},
    selectedPatient: { 
      patientId: '', 
      patientName: 'Test', 
      patientSex: 'F', 
      medicalHistory: '',
      drugHistory: '', 
      villageNumber:'', 
      readings: []
    },
    showSelectedPatient : false,
  }

  componentDidMount = () => {
    console.log("this.props: ", this.props);
    
    // route to single patient page
    if(this.props.match && this.props.match.params && this.props.match.params.id) {
      console.log(this.props.match.params.id);

      this.props.getPatient(this.props.match.params.id);
    }

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

  static getDerivedStateFromProps(props, state) {
    if (props.patient && props.patient != state.rawPatient) {
      return {
        ...state,
        rawPatient: props.patient,
        selectedPatient: {
          ...props.patient,
          needsAssessment: false
        },
        showSelectedPatient: props.match && props.match.params && props.match.params.id != null
      }
    }
    return null;
  }
  
  patientCallback = (selectedPatient) => {
    console.log('Received callback: ')
    // this.setState({'selectedPatient': selectedPatient, 'showSelectedPatient': true })
    this.props.history.push(`/patient/${selectedPatient.patientId}`);
  }

  backBtnCallback = (status) => {
    this.setState({ 'showSelectedPatient' : false })
  }


  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />
    }

    console.log("state: ", this.state);
    console.log("this.state.showSelectedPatient: ", this.state.showSelectedPatient);

    return (
      <div>
        {this.state.showSelectedPatient ? (
          <PatientSummary callbackFromParent={this.backBtnCallback} selectedPatient={this.state.selectedPatient}></PatientSummary>
        ) : (
          <PatientTable callbackFromParent={this.patientCallback} data={this.props.patients.patientsList} isLoading={this.props.patients.isLoading}></PatientTable>
        )}
      </div>
    )
  }
}

const mapStateToProps = ({ patients, user }) => ({
  patient: patients.patient,
  patients: {
    patientsList: patients.patientsList
  },
  user : user.currentUser
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getPatients,
      getCurrentUser,
      getPatient
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PatientPage)
