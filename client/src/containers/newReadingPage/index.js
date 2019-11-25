import React, {Component} from 'react';
import Paper from '@material-ui/core/Paper';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getCurrentUser } from '../../actions/users';
import { newReadingPost } from '../../actions/newReading';
import PatientInfoForm from './patientInfoForm';
import BpForm from './bpForm';
import SymptomForm from './symptomForm';
import SweetAlert from 'sweetalert2-react';

import {
  Button, Header, Divider,
  Form, Select, Input,
  TextArea
} from 'semantic-ui-react'

import './index.css'

var symptom = []

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class NewReadingPage extends Component {
  state = { 
    patient: {
      patientId: "",
      patientName: "",
      patientAge: "",
      patientSex: "FEMALE",
      isPregnant: true,
      gestationalAgeValue: "",
      gestationalAgeUnit: "GESTATIONAL_AGE_UNITS_WEEKS",
      zone: "",
      block: "",
      tank: "",
      villageNumber: "",
      drugHistory: "",
      medicalHistory: ""
    },
    reading: {
      userId: "",
      readingId: "",
      dateTimeTaken: "",
      bpSystolic: "",
      bpDiastolic: "",
      heartRateBPM: "",
      dateRecheckVitalsNeeded: "",
      isFlaggedForFollowup: false,
      symptoms: ""
    },
    checkedItems: {
      none: true,
      headache: false,
      bleeding: false,
      blurredVision: false,
      feverish: false,
      abdominalPain: false,
      unwell: false,
      other: false,
      otherSymptoms: ""
    },
    showSuccessReading : false
  }


  componentDidMount = () => {
    this.props.getCurrentUser().then((err) => {
      if (err !== undefined) {
        // error from getCurrentUser(), don't get statistics
        return
      }
      
    })
  }


  handleChange = event => {
    this.setState({ patient: { ...this.state.patient, [event.target.name]: event.target.value }})
  }

  handleSelectChange = (e, value) => {
    if (value.name === "patientSex" && value.value === "MALE") {
      this.setState({ patient: { ...this.state.patient, patientSex : "MALE", gestationalAgeValue : "", isPregnant : false }})
    } else {
      this.setState({ patient: { ...this.state.patient, [value.name] : value.value }})
    }
  }

  handleReadingChange = (e, value) => {
    this.setState({ reading: { ...this.state.reading, [value.name] : value.value }})
  }

  handleCheckedChange = (e, value) => {
    //console.log(value.name)
    // true => false, pop
    if (value.value) {
      if (symptom.indexOf(value.name) >= 0) {
        symptom.pop(value.name)
      }
    } else { // false => true, push
      if (symptom.indexOf(value.name) < 0) {
        symptom.push(value.name)
      }
    }
    //console.log(symptom)
    if (value.name != 'none') {
      if (symptom.indexOf('none') >= 0) {
        symptom.pop('none')
      }
      this. setState({ 
        checkedItems: { 
          ...this.state.checkedItems, 
          [value.name] : !value.value,
          none: false
        }})
    } else {
      while(symptom.length > 0) {
        symptom.pop();
      }
      this. setState({ 
        checkedItems: {
          none: true,
          headache: false,
          bleeding: false,
          blurredVision: false,
          feverish: false,
          abdominalPain: false,
          unwell: false,
          other: false,
          otherSymptoms: ""
        }
      })
    }
  }

  handleOtherSymptom = event => {
    //console.log(event.target)
    this.setState({ checkedItems: { ...this.state.checkedItems, [event.target.name]: event.target.value }})
  }

  handleSubmit = event => {
    event.preventDefault()
    console.log('Create new submit')

    if (symptom.indexOf('other') >= 0) {
      symptom.pop('other')
      if (this.state.checkedItems.otherSymptoms != '') {
        symptom.push(this.state.checkedItems.otherSymptoms)
      }
    }

    var dateTime = new Date()
    var readingID = guid()

    this.setState({ 
      reading: {
        ...this.state.reading,
        userId: this.props.user.userId,
        readingId: readingID,
        dateTimeTaken: dateTime,
        symptoms: symptom.toString()
      }
    }, function() {
      let patientData = JSON.parse(JSON.stringify(this.state.patient))
      let readingData = JSON.parse(JSON.stringify(this.state.reading))

      let newData = {
        patient: patientData,
        reading: readingData
      }
      console.log(newData)
      this.props.newReadingPost(newData).then( () => {
          console.log(this.props.createReadingStatusError)
          // reset fields after form submit
          if (this.props.createReadingStatusError === false) {
            
            this.setState({
              patient: {
                patientId: "",
                patientName: "",
                patientAge: "",
                patientSex: "FEMALE",
                isPregnant: true,
                gestationalAgeValue: "",
                gestationalAgeUnit: "GESTATIONAL_AGE_UNITS_WEEKS",
                zone: "",
                block: "",
                tank: "",
                villageNumber: "",
                drugHistory: "",
                medicalHistory: ""
              },
              reading: {
                userId: "",
                readingId: "",
                dateTimeTaken: "",
                bpSystolic: "",
                bpDiastolic: "",
                heartRateBPM: "",
                dateRecheckVitalsNeeded: "",
                isFlaggedForFollowup: false,
                symptoms: ""
              },
              checkedItems: {
                none: false,
                headache: false,
                bleeding: false,
                blurredVision: false,
                feverish: false,
                abdominalPain: false,
                unwell: false,
                other: false,
                otherSymptoms: ""
              },
              showSuccessReading: true
          })
        }
      })
    })
  }

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />
    }

    return (
      <div style={{maxWidth:1200, marginLeft: "auto", marginRight: "auto"}}>
        <h1><b>Create a new patient and reading:</b></h1> 
        <Divider/>
        <Form onSubmit={this.handleSubmit}>
          <PatientInfoForm patient={this.state.patient} onChange={this.handleChange} onSelectChange={this.handleSelectChange}/>
          <BpForm reading={this.state.reading} onChange={this.handleReadingChange}/>
          <SymptomForm 
            checkedItems={this.state.checkedItems} 
            patient={this.state.patient} 
            onChange={this.handleCheckedChange} 
            onOtherChange={this.handleOtherSymptom}
          />

          <div style={{"clear" : "both"}}></div>
          <div className='contentRight'>
            <Button 
            style={{"backgroundColor" : "#84ced4"}} 
            type='submit'>
              Submit
            </Button>
          </div>
        </Form>

        <SweetAlert
          type="success"
          show={this.state.showSuccessReading}
          title="Patient Reading Created!"
          text="Success! You can view the new reading by going to the Patients tab"
          onConfirm={() => this.setState({ showSuccessReading: false })}
        />
      </div>
    )
  }
}

const mapStateToProps = ({ user, newReading }) => ({
  user : user.currentUser,
  createReadingStatusError: newReading.error
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getCurrentUser,
      newReadingPost,
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewReadingPage)
