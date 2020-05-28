import React from 'react';
import Paper from '@material-ui/core/Paper';

import {
  Form,
  Header,
  Divider,
  Select,
  Input,
  TextArea
} from 'semantic-ui-react';

const sexOptions = [
  { key: 'm', text: 'Male', value: 'MALE' },
  { key: 'f', text: 'Female', value: 'FEMALE' },
  { key: 'o', text: 'Other', value: 'I' }
];

const pregOptions = [
  { key: 'y', text: 'Yes', value: true },
  { key: 'n', text: 'No', value: false }
];

export const GESTATIONAL_AGE_UNITS = {
  WEEKS: 'GESTATIONAL_AGE_UNITS_WEEKS',
  MONTHS: 'GESTATIONAL_AGE_UNITS_MONTHS'
};

const gestationalAgeUnitOptions = [
  { key: 'week', text: 'Weeks', value: GESTATIONAL_AGE_UNITS.WEEKS },
  { key: 'month', text: 'Months', value: GESTATIONAL_AGE_UNITS.MONTHS }
];

export function PatientInfoForm(props: any) {
  return (
    <Paper style={{ padding: '35px 25px', borderRadius: '15px' }}>
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
          options={pregOptions}
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
}
