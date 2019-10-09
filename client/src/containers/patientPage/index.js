import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getPatients } from '../../actions/patients'
import { getCurrentUser } from '../../actions/users'
import PatientTable from './patientTable'
import PatientSummary from './patientSummary'


class PatientPage extends Component {
  state = {
    selectedPatient: { patientId: '', patientName: 'Test', 
                       patientSex: 'F', medicalHistory: '',
                       drugHistory: '', villageNumber:'', readings: []
                      },
    showSelectedPatient : false,
  }

  componentDidMount = () => {
    this.props.getCurrentUser().then((err) => {
      if (err !== undefined) {
        // error from getCurrentUser(), don't get patients
        return
      }
      
      this.props.getPatients()
    })
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
          // <div>
          //   <Button onClick={() => this.setState({ 'showSelectedPatient' : false }) }>Back</Button>
          //   <h1>Patient Summary</h1>
          //   <h2>{this.state.selectedPatient.patientName}</h2>
          // </div>
          <PatientSummary callbackFromParent={this.backBtnCallback} selectedPatient={this.state.selectedPatient}></PatientSummary>
        ) : (
          <PatientTable callbackFromParent={this.patientCallback} data={this.props.patients.patientsList}></PatientTable>
        )}
      </div>
    )
  }
}

const mapStateToProps = ({ patients, user }) => ({
  patients : patients,
  user : user.currentUser
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getPatients,
      getCurrentUser,
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PatientPage)
