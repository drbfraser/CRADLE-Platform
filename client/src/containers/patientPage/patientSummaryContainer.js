import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getPatient } from '../../actions/patients'
import { getCurrentUser } from '../../actions/users'
import PatientSummary from './patientSummary';

class PatientSummaryContainer extends Component {
    constructor(props) {
        super(props);
        // TO DO: don't fetch patientData everytime, get it from redux if possible.
        this.props.getPatient(this.props.match.params.id);
    }

    componentDidMount() {
        this.props.getCurrentUser().then((err) => {
            if (err !== undefined) {
              
                this.props.getPatient(this.props.match.params.id);

                return
            }
        });
    }

    backBtnCallback = () => {
        this.props.history.goBack();
    }

    render() {

        if (!this.props.user.isLoggedIn) {
            return <div />
          }

        if(this.props.isLoading) {
            return (
                <div>Loading...</div>
            )
        }

        return (
            <PatientSummary callbackFromParent={this.backBtnCallback} selectedPatient={this.props.patient}/>
        )
    }
}

const mapStateToProps = ({ patients, user }) => ({
    patient: patients.patient,
    isLoading: patients.isLoading,
    user : user.currentUser,
  })
  
  const mapDispatchToProps = dispatch =>
    bindActionCreators(
      {
        getPatient,
        getCurrentUser,
      },
      dispatch
    )
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(PatientSummaryContainer)
  