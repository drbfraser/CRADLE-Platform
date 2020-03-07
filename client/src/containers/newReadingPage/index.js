import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getCurrentUser } from '../../actions/users';
import { newReadingPost } from '../../actions/newReading';
import PatientInfoForm from './patientInfoForm';
import BpForm from './bpForm';
import SymptomForm from './symptomForm';
import UrineTestForm, { initialUrineTests } from './urineTestForm';
import SweetAlert from 'sweetalert2-react';

import {Button, Divider, Form} from 'semantic-ui-react'

import './index.css'

var symptom = []

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = (c === 'x') ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

const GESTATIONAL_AGE_UNITS = {
  WEEKS: "GESTATIONAL_AGE_UNITS_WEEKS",
  MONTHS: "GESTATIONAL_AGE_UNITS_MONTHS"
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
      gestationalAgeUnit: GESTATIONAL_AGE_UNITS.WEEKS,
      zone: "",
      dob: null,
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
      symptoms: "",
      urineTests: initialUrineTests
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
    showSuccessReading: false,
    hasUrineTest: false
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

  handleUrineTestChange = (e, value) => {
    this.setState({
      reading: {
        ...this.state.reading,
        urineTests: {
          ...this.state.reading.urineTests,
          [value.name]: value.value
        }
      }
    })
  }

  handleUrineTestSwitchChange = (e) => {
    this.setState({
      hasUrineTest: e.target.checked
    })
    if (!e.target.checked) {
      this.setState({
        reading: {
          ...this.state.reading,
          urineTests: initialUrineTests
        }
      })
    }
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
    if (value.name !== 'none') {
      if (symptom.indexOf('none') >= 0) {
        symptom.pop('none')
      }
      this.setState({ 
        checkedItems: { 
          ...this.state.checkedItems, 
          [value.name] : !value.value,
          none: false
        }})
    } else {
      while(symptom.length > 0) {
        symptom.pop();
      }
      this.setState({ 
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
      if (this.state.checkedItems.otherSymptoms !== '') {
        symptom.push(this.state.checkedItems.otherSymptoms)
      }
    }
    if (this.state.patient.patientAge == '') {
      this.state.patient.patientAge = null
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
      if (!this.state.hasUrineTest) {
        readingData.urineTests = null
      }

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
                gestationalAgeUnit: GESTATIONAL_AGE_UNITS.WEEKS,
                zone: "",
                dob: null,
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
                symptoms: "",
                urineTests: initialUrineTests
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
              showSuccessReading: true,
              hasUrineTest: false
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
          <div className='leftContainer'>
            <BpForm reading={this.state.reading} onChange={this.handleReadingChange}/>
            <SymptomForm 
              checkedItems={this.state.checkedItems} 
              patient={this.state.patient} 
              onChange={this.handleCheckedChange} 
              onOtherChange={this.handleOtherSymptom}
            />
          </div>
          <div className="rightContainer">
            <UrineTestForm
              reading={this.state.reading}
              onChange={this.handleUrineTestChange}
              onSwitchChange={this.handleUrineTestSwitchChange}
              hasUrineTest={this.state.hasUrineTest}
            />
          </div>
          
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
