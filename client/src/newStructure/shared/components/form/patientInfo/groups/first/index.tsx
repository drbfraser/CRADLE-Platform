import {
  Form,
  Input,
} from 'semantic-ui-react';

interface IProps {
  isEditPage: any
  patient: any
  onChange: any
}

export const FirstGroup: React.FC<IProps> = ({
  isEditPage,
  patient,
  onChange,
}) => (
  <Form.Group>
    <Form.Field
      name="patientName"
      value={ patient.patientName }
      control={ Input }
      label="Patient Initials"
      placeholder="Patient Initials"
      onChange={ onChange }
      type="text"
      pattern="[a-zA-Z]*"
      maxLength="4"
      minLength="1"
      required
    />
    { !isEditPage && (
      <Form.Field
        name="patientId"
        value={ patient.patientId }
        control={ Input }
        label="ID"
        placeholder="ID Number"
        onChange={ onChange }
        type="text"
        maxLength="15"
        minLength="1"
        required
      />
    ) }
  </Form.Group>
);
