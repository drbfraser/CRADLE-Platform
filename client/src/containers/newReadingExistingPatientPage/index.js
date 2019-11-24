import React, {Component} from 'react';
import Paper from '@material-ui/core/Paper';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
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

class NewReadingExistingPatientPage extends Component {
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
      <div style={{maxWidth:1200, marginLeft: "auto", marginRight: "auto"}}>
        <h1><b>Create a new reading:</b></h1> 
        <Divider/>

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
)(NewReadingExistingPatientPage)
