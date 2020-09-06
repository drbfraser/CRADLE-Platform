import { Form, Header, InputOnChangeData, Select } from 'semantic-ui-react';

import { NewReading } from '@types';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import Switch from '@material-ui/core/Switch';
import classes from '../styles.module.css';

const resultOptions = [
  { key: 'm', text: '-', value: '-' },
  { key: 'p', text: '+', value: '+' },
  { key: 'pp', text: '++', value: '++' },
  { key: 'ppp', text: '+++', value: '+++' },
];

export const urineTestChemicals = {
  LEUC: 'Leukocytes',
  NIT: 'Nitrites',
  GLU: 'Glucose',
  PRO: 'Protein',
  BLOOD: 'Blood',
};

export const initialUrineTests = {
  urineTestNit: '',
  urineTestBlood: '',
  urineTestLeuc: '',
  urineTestPro: '',
  urineTestGlu: '',
};

interface IProps {
  hasUrineTest: boolean;
  newReading: NewReading;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => void;
  onSwitchChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

export const UrineTestForm: React.FC<IProps> = (props) => {
  return (
    <Paper
      className={classes.urineTestCard}
      style={{ padding: '35px 25px', borderRadius: '15px' }}>
      <Header>
        <b>Urine Test</b>
        <Switch
          className={classes.urineTestSwitch}
          checked={props.hasUrineTest}
          onChange={props.onSwitchChange}
          color="primary"
        />
      </Header>
      {props.hasUrineTest && (
        <div className={classes.urineTest}>
          <Form.Field
            className={classes.input}
            name="urineTestLeuc"
            control={Select}
            label={urineTestChemicals.LEUC}
            options={resultOptions}
            placeholder="Test Result"
            onChange={props.onChange}
            disabled={!props.hasUrineTest}
            required={true}
            value={props.newReading.urineTests.urineTestLeuc}
          />
          <Form.Field
            className={classes.input}
            name="urineTestNit"
            control={Select}
            label={urineTestChemicals.NIT}
            options={resultOptions}
            placeholder="Test Result"
            onChange={props.onChange}
            disabled={!props.hasUrineTest}
            required={true}
            value={props.newReading.urineTests.urineTestNit}
          />
          <Form.Field
            className={classes.input}
            name="urineTestGlu"
            control={Select}
            label={urineTestChemicals.GLU}
            options={resultOptions}
            placeholder="Test Result"
            onChange={props.onChange}
            disabled={!props.hasUrineTest}
            required={true}
            value={props.newReading.urineTests.urineTestGlu}
          />
          <Form.Field
            className={classes.input}
            name="urineTestPro"
            control={Select}
            label={urineTestChemicals.PRO}
            options={resultOptions}
            placeholder="Test Result"
            onChange={props.onChange}
            disabled={!props.hasUrineTest}
            required={true}
            value={props.newReading.urineTests.urineTestPro}
          />
          <Form.Field
            className={classes.input}
            name="urineTestBlood"
            control={Select}
            label={urineTestChemicals.BLOOD}
            options={resultOptions}
            placeholder="Test Result"
            onChange={props.onChange}
            disabled={!props.hasUrineTest}
            required={true}
            value={props.newReading.urineTests.urineTestBlood}
          />
        </div>
      )}
    </Paper>
  );
};
