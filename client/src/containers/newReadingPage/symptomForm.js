import React from 'react';
import Paper from '@material-ui/core/Paper';
import {
  Form, Header
} from 'semantic-ui-react';

import './index.css'

function SymptomForm(props) {
  //console.log(props)
  return (
    <Paper className='symptomCard' style={{ "padding": "35px 25px", "borderRadius": "15px" }}>
      <Form className='centerize'>
        <Header><b>Symptoms</b></Header>
        <div>
          <Form.Checkbox
            value={props.checkedItems.none}
            name='none'
            label='None (patient healthy)'
            onChange={props.onChange}
          />
          <Form.Group widths='equal'>
            <Form.Checkbox
              value={props.checkedItems.headache}
              name='headache'
              label='Headache'
              onChange={props.onChange}
            />
            <Form.Checkbox
              value={props.checkedItems.bleeding}
              name='bleeding'
              label='Bleeding'
              onChange={props.onChange}
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Checkbox
              value={props.checkedItems.blurredVision}
              name='blurredVision'
              label='Blurred vision'
              onChange={props.onChange}
            />
            <Form.Checkbox
              value={props.checkedItems.feverish}
              name='feverish'
              label='Feverish'
              onChange={props.onChange}
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Checkbox
              value={props.checkedItems.abdominalPain}
              name='abdominalPain'
              label='Abdominal pain'
              onChange={props.onChange}
            />
            <Form.Checkbox
              value={props.checkedItems.unwell}
              name='unwell'
              label='Unwell'
              onChange={props.onChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Checkbox
              value={props.checkedItems.other}
              widths='3'
              name='other'
              label='Other:'
              onChange={props.onChange}
            />
            <Form.TextArea
              widths='1'
              name='otherSymptoms'
              value={props.checkedItems.otherSymptoms}
              onChange={props.onOtherChange}
            />
          </Form.Group>
        </div>
      </Form>
    </Paper>
  )
}

export default SymptomForm