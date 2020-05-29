import {
  Form,
  Input,
  Select
} from 'semantic-ui-react';
import { sexOptions } from './utils';


interface IProps {
  patient: any
  onChange: any
}

export const SecondGroup: React.FC<IProps> = ({
  patient,
  onChange,
}) => (
  <Form.Group widths="equal">
    <Form.Field
      name="patientAge"
      value={ patient.patientAge }
      control={ Input }
      label="Age"
      type="number"
      min="15"
      max="60"
      placeholder="Patient Age"
      onChange={ onChange }
    />
    <Form.Field
      name="dob"
      value={ patient.dob }
      control={ Input }
      label="Birthday"
      type="date"
      placeholder="Birthday"
      onChange={ onChange }
    />
    <Form.Field
      name="patientSex"
      value={ patient.patientSex }
      control={ Select }
      label="Gender"
      options={ sexOptions }
      placeholder="Gender"
      onChange={ onChange }
      required
    />
  </Form.Group>
);
