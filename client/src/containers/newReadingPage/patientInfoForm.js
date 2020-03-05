import React from 'react';
import Paper from '@material-ui/core/Paper';

import { 
  Form, Header, Divider, 
  Select, Input, TextArea, 
} from 'semantic-ui-react';

const sexOptions = [
  { key: 'm', text: 'Male', value: 'MALE' },
  { key: 'f', text: 'Female', value: 'FEMALE' },
  { key: 'o', text: 'Other', value: 'I' },
]

const pregOptions = [
  { key: 'y', text: 'Yes', value: true },
  { key: 'n', text: 'No', value: false },
]

function PatientInfoForm(props) {
  return (
      <Paper style={{"padding" : "35px 25px", "borderRadius" : "15px"}}>
          <Header><b>Patient Information</b></Header>
          <Divider/>
          <Form.Group widths='equal'>
            <Form.Field 
              name="patientName"
              value={props.patient.patientName}
              control={Input}
              label='Patient Initials'
              placeholder='Patient Initials'
              onChange={props.onChange}
              type='text'
              pattern="[a-zA-Z]*"
              maxLength='4'
              minLength='1'
              required
            />
            <Form.Field 
              name="patientId"
              value={props.patient.patientId}
              control={Input}
              label='ID'
              placeholder='ID Number'
              onChange={props.onChange}
              type='text'
              maxLength='15'
              minLength='1'
              required
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Field 
              name="patientAge"
              value={props.patient.patientAge}
              control={Input}
              label='Age'
              type='number'
              min='15'
              max='60'
              placeholder='Patient Age'
              onChange={props.onChange}
            />
            <Form.Field
               name="dob"
               value={props.patient.dob}
               control={Input}
               label='Birthday'
               type='date'
               placeholder='Birthday'
               onChange={props.onSelectChange}
            />
            <Form.Field 
              name="patientSex"
              value={props.patient.patientSex}
              control={Select}
              label='Gender'
              options={sexOptions}
              placeholder='Gender'
              onChange={props.onSelectChange}
              required
            />
            <Form.Field
              name='isPregnant'
              value={props.patient.isPregnant}
              control={Select}
              label='Pregnant'
              options={pregOptions}
              onChange={props.onSelectChange}
              disabled={props.patient.patientSex === 'MALE'}
            />
            <Form.Field 
              name="gestationalAgeValue"
              value={props.patient.gestationalAgeValue}
              control={Input}
              label='Gestational Age'
              placeholder='Gestational Age in Weeks'
              type='number'
              min='1'
              max='60'
              onChange={props.onChange}
              disabled={props.patient.patientSex === 'MALE' || !props.patient.isPregnant}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Field 
              name="zone"
              value={props.patient.zone}
              control={Input}
              label='Zone'
              type='number'
              placeholder='Zone'
              onChange={props.onChange}
            />
            
            <Form.Field 
              name="villageNumber"
              value={props.patient.villageNumber}
              control={Input}
              label='Village'
              type='number'
              placeholder='Village'
              onChange={props.onChange}
            />
          </Form.Group>
          <Form.Field
            name="drugHistory"
            value={props.patient.drugHistory}
            control={TextArea}
            label='Drug History'
            placeholder="Patient's drug history..."
            onChange={props.onChange}
          />
          <Form.Field
            name="medicalHistory"
            value={props.patient.medicalHistory}
            control={TextArea}
            label='Medical History'
            placeholder="Patient's medical history..."
            onChange={props.onChange}
          />
      </Paper> 
  );
}

export default PatientInfoForm