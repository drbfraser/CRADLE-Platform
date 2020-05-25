import { Form, Header } from 'semantic-ui-react';

import Paper from '@material-ui/core/Paper';
import React from 'react';
import classes from './styles.module.css';

interface IProps {
  checkedItems: any;
  onChange: any;
  onOtherChange: any;
}

export const SymptomForm: React.FC<IProps> = ({
  checkedItems,
  onChange,
  onOtherChange
}) => (
  <Paper className={classes.container}>
    <Header>
      <b>Symptoms</b>
    </Header>
    <Form.Checkbox
      checked={checkedItems.none}
      value={checkedItems.none}
      name="none"
      label="None (patient healthy)"
      onChange={onChange}
    />
    <Form.Group widths="equal">
      <Form.Checkbox
        checked={checkedItems.headache}
        value={checkedItems.headache}
        name="headache"
        label="Headache"
        onChange={onChange}
      />
      <Form.Checkbox
        checked={checkedItems.bleeding}
        value={checkedItems.bleeding}
        name="bleeding"
        label="Bleeding"
        onChange={onChange}
      />
    </Form.Group>
    <Form.Group widths="equal">
      <Form.Checkbox
        checked={checkedItems.blurredVision}
        value={checkedItems.blurredVision}
        name="blurredVision"
        label="Blurred vision"
        onChange={onChange}
      />
      <Form.Checkbox
        checked={checkedItems.feverish}
        value={checkedItems.feverish}
        name="feverish"
        label="Feverish"
        onChange={onChange}
      />
    </Form.Group>
    <Form.Group widths="equal">
      <Form.Checkbox
        checked={checkedItems.abdominalPain}
        value={checkedItems.abdominalPain}
        name="abdominalPain"
        label="Abdominal pain"
        onChange={onChange}
      />
      <Form.Checkbox
        checked={checkedItems.unwell}
        value={checkedItems.unwell}
        name="unwell"
        label="Unwell"
        onChange={onChange}
      />
    </Form.Group>
    <Form.Group>
      <Form.Checkbox
        checked={checkedItems.other}
        value={checkedItems.other}
        widths="3"
        name="other"
        label="Other:"
        onChange={onChange}
      />
      <Form.TextArea
        checked={checkedItems.otherSymptoms}
        widths="1"
        name="otherSymptoms"
        value={checkedItems.otherSymptoms}
        onChange={onOtherChange}
        disabled={!checkedItems.other}
      />
    </Form.Group>
  </Paper>
);
