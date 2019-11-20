import React, {Component} from 'react';
import MaterialTable from 'material-table';
import Paper from '@material-ui/core/Paper';
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getPatients } from '../../actions/patients';
import { getCurrentUser } from '../../actions/users';

import { Button,
  Header, Image, Modal,
  Divider, Form, Select,
  Input, TextArea, Icon
} from 'semantic-ui-react'

import './index.css'

const sexOptions = [
  { key: 'm', text: 'Male', value: 'MALE' },
  { key: 'f', text: 'Female', value: 'FEMALE' },
  { key: 'o', text: 'Other', value: 'I' },
]

const pregOptions = [
  { key: 'y', text: 'Yes', value: true },
  { key: 'n', text: 'No', value: false },
]

class NewReadingPage extends Component {
  state = { 
    patient: {
      patientId: "",
      patientName: "",
      patientAge: "",
      patientSex: "FEMALE",
      isPregnant: true,
      gestationalAgeValue: "",
      zone: "",
      block: "",
      tank: "",
      villageNumber: "",
      drugHistory: "",
      medicalHistory: "",
      readings: [],
      gestationalAgeUnit: "GESTATIONAL_AGE_UNITS_WEEKS"
    }
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
    this.setState({ patient: { ...this.state.patient, [value.name] : value.value }})
  }

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />
    }

    return (
      <div>
        <h1><b>Create a new patient and reading:</b></h1> 
        <Divider/>
        <Paper style={{"padding" : "35px 25px", "borderRadius" : "15px"}}>
          <Form>
            <Header><b>Patient Information</b></Header>
            <Divider/>
            <Form.Group widths='equal'>
              <Form.Field 
                name="patientName"
                value={this.state.patient.patientName}
                control={Input}
                label='Name'
                placeholder='Patient Name'
                onChange={this.handleChange}
              />
              <Form.Field 
                name="patientId"
                value={this.state.patient.patientId}
                control={Input}
                label='ID'
                placeholder='ID Number'
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Field 
                name="patientAge"
                value={this.state.patient.patientAge}
                control={Input}
                label='Age'
                placeholder='Patient Age'
                onChange={this.handleChange}
              />
              <Form.Field 
                name="patientSex"
                value={this.state.patient.patientSex}
                control={Select}
                label='Gender'
                options={sexOptions}
                placeholder='Gender'
                onChange={this.handleSelectChange}
              />
              <Form.Field
                name='isPregnant'
                value={this.state.patient.isPregnant}
                control={Select}
                label='Pregnant'
                options={pregOptions}
                onChange={this.handleSelectChange}
              />
              <Form.Field 
                name="gestationalAgeValue"
                value={this.state.patient.gestationalAgeValue}
                control={Input}
                label='Gestational Age'
                placeholder='Gestational Age in Weeks'
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Field 
                name="zone"
                value={this.state.patient.zone}
                control={Input}
                label='Zone'
                placeholder='Zone'
                onChange={this.handleChange}
              />
              <Form.Field 
                name="block"
                value={this.state.patient.block}
                control={Input}
                label='Block'
                placeholder='Block'
                onChange={this.handleChange}
              />
              <Form.Field 
                name="tank"
                value={this.state.patient.tank}
                control={Input}
                label='Tank'
                placeholder='Tank'
                onChange={this.handleChange}
              />
              <Form.Field 
                name="villageNumber"
                value={this.state.patient.villageNumber}
                control={Input}
                label='Village Number'
                placeholder='Village Number'
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Field
              name="drugHistory"
              value={this.state.patient.drugHistory || ''}
              control={TextArea}
              label='Drug History'
              placeholder="Patient's drug history..."
              onChange={this.handleChange}
            />
            <Form.Field
              name="medicalHistory"
              value={this.state.patient.medicalHistory || ''}
              control={TextArea}
              label='Medical History'
              placeholder="Patient's medical history..."
              onChange={this.handleChange}
            />
          </Form>
        </Paper> 
        <Paper className='bpCard' style={{"padding" : "35px 25px", "borderRadius" : "15px"}}>
          <Form className='centerize'>
            <Header><b>Blood Pressure</b></Header>
            <div className='bpField'>
              <Form.Field inline
                name="systolic"
                value={''}
                control={Input}
                label='Systolic:'
              />
              <Form.Field inline
                name="diastolic"
                value={''}
                control={Input}
                label='Diastolic:'
              />
              <Form.Field inline
                name="heartRate"
                value={''}
                control={Input}
                label='Heart rate:'
              />
            </div>
          </Form>
        </Paper>
        <Paper className='symptomCard' style={{"padding" : "35px 25px", "borderRadius" : "15px"}}>
          <Form className='centerize'>
            <Header><b>Symptoms</b></Header>
            <div>
              <Form.Checkbox
                label='None (patient healthy)'
              />
              <Form.Group widths='equal'>
                <Form.Checkbox
                  label='Headache'
                />
                <Form.Checkbox
                  label='Bleeding'
                />
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Checkbox
                  label='Blurred vision'
                />
                <Form.Checkbox
                  label='Feverish'
                />
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Checkbox
                  label='Abdominal pain'
                />
                <Form.Checkbox
                  label='Unwell'
                />
              </Form.Group>
              <Form.Group>
                <Form.Checkbox 
                  widths='3'
                  label='Other:'
                />
                <Form.TextArea
                  widths='1'
                  name='otherSymptoms'
                />
              </Form.Group>
            </div>
          </Form>
        </Paper>
        <div style={{"clear" : "both"}}></div>
        <div className='contentRight'>
          <Button style={{"backgroundColor" : "#84ced4"}} type='submit'>Submit</Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user : user.currentUser
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getCurrentUser,
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewReadingPage)
