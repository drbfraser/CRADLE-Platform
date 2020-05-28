import {
  Form,
  Input,
  Select,
} from 'semantic-ui-react';
import React from 'react';
import { gestationalAgeUnitOptions, pregnantOptions } from './utils';
import { GESTATIONAL_AGE_UNITS } from '../../../../../../../utils';

interface IProps {
  patient: any
  onChange: any
};

export const ThirdGroup: React.FC<IProps> = ({ patient, onChange }) => (
  <Form.Group widths="equal">
    <Form.Field
      name="isPregnant"
      value={ patient.isPregnant }
      control={ Select }
      label="Pregnant"
      options={ pregnantOptions }
      onChange={ onChange }
      disabled={ patient.patientSex === 'MALE' }
    />
    <Form.Field
      name="gestationalAgeValue"
      value={ patient.gestationalAgeValue }
      control={ Input }
      label="Gestational Age"
      placeholder="Gestational Age"
      type="number"
      min="1"
      max={
        patient.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.WEEKS
          ? '60'
          : '13'
      }
      onChange={ onChange }
      disabled={
        patient.patientSex === 'MALE' || !patient.isPregnant
      }
      required
    />
    <Form.Field
      name="gestationalAgeUnit"
      value={ patient.gestationalAgeUnit }
      control={ Select }
      options={ gestationalAgeUnitOptions }
      onChange={ onChange }
      label="Gestational Age Unit"
      disabled={
        patient.patientSex === 'MALE' || !patient.isPregnant
      }
      required
    />
  </Form.Group>
);
