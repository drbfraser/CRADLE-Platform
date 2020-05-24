import {
  Divider,
  Form,
  Header,
  Input,
  Select,
  TextArea,
} from 'semantic-ui-react';
import { gestationalAgeUnitOptions, pregnantOptions, sexOptions } from './utils';

import { GESTATIONAL_AGE_UNITS } from '../../../utils';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import classes from './styles.module.css';

export const PatientInfoForm = (props: any) => (
  <Paper className={classes.container}>
    {!props.isEditPage && (
      <Header>
        <b>Patient Information</b>
      </Header>
    )}
    {!props.isEditPage && <Divider />}
    <Form.Group>
      <Form.Field
        name="patientName"
        value={props.patient.patientName}
        control={Input}
        label="Patient Initials"
        placeholder="Patient Initials"
        onChange={props.onChange}
        type="text"
        pattern="[a-zA-Z]*"
        maxLength="4"
        minLength="1"
        required
      />
      {!props.isEditPage && (
        <Form.Field
          name="patientId"
          value={props.patient.patientId}
          control={Input}
          label="ID"
          placeholder="ID Number"
          onChange={props.onChange}
          type="text"
          maxLength="15"
          minLength="1"
          required
        />
      )}
    </Form.Group>
    <Form.Group widths="equal">
      <Form.Field
        name="patientAge"
        value={props.patient.patientAge}
        control={Input}
        label="Age"
        type="number"
        min="15"
        max="60"
        placeholder="Patient Age"
        onChange={props.onChange}
      />
      <Form.Field
        name="dob"
        value={props.patient.dob}
        control={Input}
        label="Birthday"
        type="date"
        placeholder="Birthday"
        onChange={props.onChange}
      />
      <Form.Field
        name="patientSex"
        value={props.patient.patientSex}
        control={Select}
        label="Gender"
        options={sexOptions}
        placeholder="Gender"
        onChange={props.onChange}
        required
      />
    </Form.Group>
    <Form.Group widths="equal">
      <Form.Field
        name="isPregnant"
        value={props.patient.isPregnant}
        control={Select}
        label="Pregnant"
        options={pregnantOptions}
        onChange={props.onChange}
        disabled={props.patient.patientSex === 'MALE'}
      />
      <Form.Field
        name="gestationalAgeValue"
        value={props.patient.gestationalAgeValue}
        control={Input}
        label="Gestational Age"
        placeholder="Gestational Age"
        type="number"
        min="1"
        max={
          props.patient.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.WEEKS
            ? '60'
            : '13'
        }
        onChange={props.onChange}
        disabled={
          props.patient.patientSex === 'MALE' || !props.patient.isPregnant
        }
        required
      />
      <Form.Field
        name="gestationalAgeUnit"
        value={props.patient.gestationalAgeUnit}
        control={Select}
        options={gestationalAgeUnitOptions}
        onChange={props.onChange}
        label="Gestational Age Unit"
        disabled={
          props.patient.patientSex === 'MALE' || !props.patient.isPregnant
        }
        required
      />
    </Form.Group>
    <Form.Group>
      <Form.Field
        name="zone"
        value={props.patient.zone}
        control={Input}
        label="Zone"
        type="number"
        placeholder="Zone"
        onChange={props.onChange}
      />

      <Form.Field
        name="villageNumber"
        value={props.patient.villageNumber}
        control={Input}
        label="Village"
        type="number"
        placeholder="Village"
        onChange={props.onChange}
      />
    </Form.Group>
    <Form.Field
      name="drugHistory"
      value={props.patient.drugHistory}
      control={TextArea}
      label="Drug History"
      placeholder="Patient's drug history..."
      onChange={props.onChange}
    />
    <Form.Field
      name="medicalHistory"
      value={props.patient.medicalHistory}
      control={TextArea}
      label="Medical History"
      placeholder="Patient's medical history..."
      onChange={props.onChange}
    />
  </Paper>
);
