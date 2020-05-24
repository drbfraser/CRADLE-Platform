import {
  Form,
  TextArea,
} from 'semantic-ui-react';

import Paper from '@material-ui/core/Paper';
import React from 'react';
import classes from './styles.module.css';
import { FormHeader } from './header';
import { FormDivider } from './divider';
import { FirstGroup } from './groups/first';
import { SecondGroup } from './groups/second';
import { ThirdGroup } from './groups/third';
import { FourthGroup } from './groups/fourth';

interface IProps {
  isEditPage: any
  patient: any
  onChange: any
}

export const PatientInfoForm: React.FC<IProps> = ({ 
  isEditPage, 
  patient, 
  onChange, 
}) => (
  <Paper className={ classes.container }>
    <FormHeader isEditPage={isEditPage} />
    <FormDivider isEditPage={isEditPage} />
    <FirstGroup isEditPage={isEditPage} patient={patient} onChange={onChange} />
    <SecondGroup patient={patient} onChange={onChange} />
    <ThirdGroup patient={patient} onChange={onChange} />
    <FourthGroup patient={patient} onChange={onChange} />
    <Form.Field
      name="drugHistory"
      value={ patient.drugHistory }
      control={ TextArea }
      label="Drug History"
      placeholder="Patient's drug history..."
      onChange={ onChange }
    />
    <Form.Field
      name="medicalHistory"
      value={ patient.medicalHistory }
      control={ TextArea }
      label="Medical History"
      placeholder="Patient's medical history..."
      onChange={ onChange }
    />
  </Paper>
);
