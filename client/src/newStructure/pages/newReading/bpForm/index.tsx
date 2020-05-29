import React from 'react';
import Paper from '@material-ui/core/Paper';
import { Form, Header, Input } from 'semantic-ui-react';
import { PatientNewReadingReading } from '../../../types';
import '../index.css';

interface IProps {
  reading: PatientNewReadingReading;
  onChange: any;
}
export function BpForm(props: IProps) {
  return (
    <Paper
      className="bpCard"
      style={{ padding: '35px 25px', borderRadius: '15px' }}>
      <Header>
        <b>Blood Pressure</b>
      </Header>
      <div className="bpField">
        <Form.Field
          inline
          name="bpSystolic"
          value={props.reading.bpSystolic}
          control={Input}
          label="Systolic:"
          type="number"
          maxLength="3"
          minLength="2"
          min="10"
          max="300"
          onChange={props.onChange}
          required
          style={{ width: '200px' }}
        />
        <Form.Field
          inline
          name="bpDiastolic"
          value={props.reading.bpDiastolic}
          control={Input}
          label="Diastolic:"
          type="number"
          maxLength="3"
          minLength="2"
          min="10"
          max="300"
          size="40"
          onChange={props.onChange}
          required
          style={{ width: '200px' }}
        />
        <Form.Field
          inline
          name="heartRateBPM"
          value={props.reading.heartRateBPM}
          control={Input}
          label="Heart rate:"
          type="number"
          maxLength="3"
          minLength="2"
          min="30"
          max="300"
          onChange={props.onChange}
          required
          style={{ width: '200px' }}
        />
      </div>
    </Paper>
  );
}
