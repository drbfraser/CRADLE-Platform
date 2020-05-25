import React from 'react';
import { Button, Form, Modal } from 'semantic-ui-react';
import { PatientInfoForm } from './info';
import classes from './styles.module.css';

interface IProps {
  displayPatientModal: boolean;
  selectedPatient: any;
  setState: any;
  updatePatient: any;
};

export const PatientModal: React.FC<IProps> = ({ 
  displayPatientModal, 
  selectedPatient, 
  setState,
  updatePatient,
}) => {
  const closePatientModal = (e: any): void => {
    if (e === 'formSubmitted') {
      setState((currentState: any): any => ({
        ...currentState,
        displayPatientModal: false,
      }));
    } else {
      // form not submitted
      // display original patient fields
      setState((currentState: any): any => ({
        ...currentState,
        selectedPatient: {
          ...currentState.selectedPatient,
          ...currentState.selectedPatientCopy
        },
        displayPatientModal: false,
      }));
    }
  };

  const handleSubmit = (event: any): void => {
    event.preventDefault();

    // pass by value
    let patientData = JSON.parse(JSON.stringify(selectedPatient));
    let patientId = patientData.patientId;

    // delete any unnecessary fields
    delete patientData.readings;
    delete patientData.needsAssessment;
    delete patientData.tableData;
    delete patientData.patientId;

    updatePatient(patientId, patientData);
    closePatientModal(`formSubmitted`);
  };

  const handleSelectChange = (_: any, value: any): void => {
    if (value.name === `patientSex` && value.value === `MALE`) {
      setState((currentState: any): any => ({
        ...currentState,
        selectedPatient: {
          ...currentState.selectedPatient,
          patientSex: `MALE`,
          gestationalAgeValue: ``,
          isPregnant: false,
        },
      }));
    } else {
      setState((currentState: any): any => ({
        ...currentState,
        selectedPatient: {
          ...currentState.selectedPatient,
          [value.name]: value.value,
        },
      }));
    }
  };

  return (
    <Modal
      closeIcon
      onClose={ closePatientModal }
      open={ displayPatientModal }>
      <Modal.Header>
        Patient Information for ID #
        { selectedPatient.patientId }
      </Modal.Header>
      <Modal.Content scrolling>
        <Form onSubmit={ handleSubmit }>
          <PatientInfoForm
            patient={ selectedPatient }
            onChange={ handleSelectChange }
            isEditPage={ true }
          />
          <Form.Field className={classes.submit} control={ Button }>
            Submit
          </Form.Field>
        </Form>
      </Modal.Content>
    </Modal>
  );
};
