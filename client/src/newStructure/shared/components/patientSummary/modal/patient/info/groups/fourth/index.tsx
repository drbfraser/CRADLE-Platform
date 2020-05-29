import {
  Form,
  Input,
} from 'semantic-ui-react';
import React from 'react';

interface IProps {
  patient: any;
  onChange: any;
};

export const FourthGroup: React.FC<IProps> = ({ patient, onChange }) => (
  <Form.Group>
    <Form.Field
      name="zone"
      value={ patient.zone }
      control={ Input }
      label="Zone"
      type="number"
      placeholder="Zone"
      onChange={ onChange }
    />

    <Form.Field
      name="villageNumber"
      value={ patient.villageNumber }
      control={ Input }
      label="Village"
      type="number"
      placeholder="Village"
      onChange={ onChange }
    />
  </Form.Group>
);
