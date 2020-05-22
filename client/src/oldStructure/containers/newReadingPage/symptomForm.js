import React from 'react'
import Paper from '@material-ui/core/Paper'
import { Form, Header } from 'semantic-ui-react'

import './index.css'

function SymptomForm(props) {
  return (
    <Paper
      className="symptomCard"
      style={{ padding: '35px 25px', borderRadius: '15px' }}>
      <Header>
        <b>Symptoms</b>
      </Header>
      <div>
        <Form.Checkbox
          checked={props.checkedItems.none}
          value={props.checkedItems.none}
          name="none"
          label="None (patient healthy)"
          onChange={props.onChange}
        />
        <Form.Group widths="equal">
          <Form.Checkbox
            checked={props.checkedItems.headache}
            value={props.checkedItems.headache}
            name="headache"
            label="Headache"
            onChange={props.onChange}
          />
          <Form.Checkbox
            checked={props.checkedItems.bleeding}
            value={props.checkedItems.bleeding}
            name="bleeding"
            label="Bleeding"
            onChange={props.onChange}
          />
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Checkbox
            checked={props.checkedItems.blurredVision}
            value={props.checkedItems.blurredVision}
            name="blurredVision"
            label="Blurred vision"
            onChange={props.onChange}
          />
          <Form.Checkbox
            checked={props.checkedItems.feverish}
            value={props.checkedItems.feverish}
            name="feverish"
            label="Feverish"
            onChange={props.onChange}
          />
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Checkbox
            checked={props.checkedItems.abdominalPain}
            value={props.checkedItems.abdominalPain}
            name="abdominalPain"
            label="Abdominal pain"
            onChange={props.onChange}
          />
          <Form.Checkbox
            checked={props.checkedItems.unwell}
            value={props.checkedItems.unwell}
            name="unwell"
            label="Unwell"
            onChange={props.onChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Checkbox
            checked={props.checkedItems.other}
            value={props.checkedItems.other}
            widths="3"
            name="other"
            label="Other:"
            onChange={props.onChange}
          />
          <Form.TextArea
            checked={props.checkedItems.otherSymptoms}
            widths="1"
            name="otherSymptoms"
            value={props.checkedItems.otherSymptoms}
            onChange={props.onOtherChange}
            disabled={!props.checkedItems.other}
          />
        </Form.Group>
      </div>
    </Paper>
  )
}

export default SymptomForm
