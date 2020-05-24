import { Form, Header, Select } from 'semantic-ui-react';

import Paper from '@material-ui/core/Paper';
import React from 'react';
import Switch from '@material-ui/core/Switch';
import { URINE_TEST_CHEMICALS } from '../../../utils';
import { resultOptions } from './utils';
import classes from './styles.module.css';

export const UrineTestForm = (props: any) => (
  <Paper className={classes.container}>
    <Header>
      <b>Urine Test</b>
      <Switch
        checked={props.hasUrineTest}
        onChange={props.onSwitchChange}
        color="primary"
      />
    </Header>
    {props.hasUrineTest && (
      <>
        <Form.Field
          name="urineTestLeuc"
          control={Select}
          label={URINE_TEST_CHEMICALS.LEUC}
          options={resultOptions}
          placeholder="Test Result"
          onChange={props.onChange}
          disabled={!props.hasUrineTest}
          required
        />
        <Form.Field
          name="urineTestNit"
          control={Select}
          label={URINE_TEST_CHEMICALS.NIT}
          options={resultOptions}
          placeholder="Test Result"
          onChange={props.onChange}
          disabled={!props.hasUrineTest}
          required
        />
        <Form.Field
          name="urineTestGlu"
          control={Select}
          label={URINE_TEST_CHEMICALS.GLU}
          options={resultOptions}
          placeholder="Test Result"
          onChange={props.onChange}
          disabled={!props.hasUrineTest}
          required
        />
        <Form.Field
          name="urineTestPro"
          control={Select}
          label={URINE_TEST_CHEMICALS.PRO}
          options={resultOptions}
          placeholder="Test Result"
          onChange={props.onChange}
          disabled={!props.hasUrineTest}
          required
        />
        <Form.Field
          name="urineTestBlood"
          control={Select}
          label={URINE_TEST_CHEMICALS.BLOOD}
          options={resultOptions}
          placeholder="Test Result"
          onChange={props.onChange}
          disabled={!props.hasUrineTest}
          required
        />
      </>
    )}
  </Paper>
);
