import React from 'react';
import { Button, Form, Header, Input, Modal } from 'semantic-ui-react';
import Paper from '@material-ui/core/Paper';
import { SymptomForm } from './form/symptom';
import { UrineTestForm } from './form/urineTest';
import { INITIAL_URINE_TESTS } from '../../../../utils';
import { guid } from './utils';
import { IState } from '../../utils';
import classes from '../styles.module.css';

interface IProps {
  checkedItems: any;
  displayReadingModal: boolean;
  hasUrineTest: boolean;
  newReading: any;
  selectedPatient: any;
  setState: React.Dispatch<React.SetStateAction<IState>>;
  symptom: any;
  user: any;
};

export const NewPatientModal: React.FC<IProps> = ({ 
  checkedItems, 
  displayReadingModal, 
  hasUrineTest,
  newReading,
  selectedPatient, 
  setState, 
  symptom,
  user,
}) => {
  const handleReadingSubmit = (event: any): void => {
    event.preventDefault();

    if (symptom.indexOf('other') >= 0) {
      symptom.pop();
      if (checkedItems.otherSymptoms !== '') {
        symptom.push(checkedItems.otherSymptoms);
      }
    }

    var dateTime = new Date();
    var readingID = guid();

    setState((currentState: IState): IState => ({
      ...currentState,
      newReading: {
        ...currentState.newReading,
        userId: user.userId,
        readingId: readingID,
        dateTimeTaken: dateTime.toJSON(),
        symptoms: symptom.toString(),
      },
      reset: true,
    }));
  };

  const closeReadingModal = (): void => setState((currentState: IState): IState => ({
    ...currentState,
    displayReadingModal: false
  }));

  const handleCheckedChange = (_: any, value: any): void => {
    console.log(value.name);
    // true => false, pop
    if (value.value) {
      if (symptom.indexOf(value.name) >= 0) {
        symptom.pop();
      }
    } else {
      // false => true, push
      if (symptom.indexOf(value.name) < 0) {
        symptom.push(value.name);
      }
    }
    console.log(symptom);
    if (value.name !== 'none') {
      if (symptom.indexOf('none') >= 0) {
        symptom.pop();
      }
      setState((currentState: IState): IState => ({
        ...currentState,
        checkedItems: {
          ...currentState.checkedItems,
          [value.name]: !value.value,
          none: false,
        },
      }));
    } else {
      while (symptom.length > 0) {
        symptom.pop();
      }
      setState((currentState: IState): IState => ({
        ...currentState,
        checkedItems: {
          none: true,
          headache: false,
          bleeding: false,
          blurredVision: false,
          feverish: false,
          abdominalPain: false,
          unwell: false,
          other: false,
          otherSymptoms: '',
        },
      }));
    }
  };

  const handleReadingChange = (_: any, value: any): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      newReading: {
        ...currentState.newReading,
        [value.name]: value.value
      },
    }));

  const handleOtherSymptom = (event: any): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      checkedItems: {
        ...currentState.checkedItems,
        [event.target.name]: event.target.value,
      },
    }));

  const handleUrineTestChange = (_: any, value: any): void =>
    setState((currentState: IState): IState => ({
      ...currentState,
      newReading: {
        ...currentState.newReading,
        urineTests: {
          ...currentState.newReading.urineTests,
          [value.name]: value.value,
        },
      },
    }));

  const handleUrineTestSwitchChange = (event: any): void => {
    setState((currentState: IState): IState => ({
      ...currentState,
      hasUrineTest: event.target.checked,
    }));

    if (!event.target.checked) {
      setState((currentState: IState): IState => ({
        ...currentState,
        newReading: {
          ...currentState.newReading,
          urineTests: INITIAL_URINE_TESTS,
        },
      }));
    }
  };

  return (
    <Modal
      closeIcon
      onClose={ closeReadingModal }
      open={ displayReadingModal }>
      <Modal.Header>Patient Information</Modal.Header>
      <Modal.Content scrolling>
        <Modal.Description>
          <Header>
            New Patient Reading for ID #
            { selectedPatient.patientId }
          </Header>
          <Form onSubmit={ handleReadingSubmit }>
            <Paper className={classes.paper}>
              <Form.Group widths="equal">
                <Form.Field
                  name="bpSystolic"
                  value={ selectedPatient.bpSystolic }
                  control={ Input }
                  label="Systolic"
                  type="number"
                  min="10"
                  max="300"
                  onChange={ handleReadingChange }
                  required
                />
                <Form.Field
                  name="bpDiastolic"
                  value={ selectedPatient.bpDiastolic }
                  control={ Input }
                  label="Diastolic"
                  type="number"
                  min="10"
                  max="300"
                  onChange={ handleReadingChange }
                  required
                />
                <Form.Field
                  name="heartRateBPM"
                  value={ selectedPatient.heartRateBPM }
                  control={ Input }
                  label="Heart rate"
                  type="number"
                  min="30"
                  max="300"
                  onChange={ handleReadingChange }
                  required
                />
              </Form.Group>
            </Paper>
            <div className={classes.symptomFormContainer}>
              <SymptomForm
                checkedItems={ checkedItems }
                onChange={ handleCheckedChange }
                onOtherChange={ handleOtherSymptom }
              />
            </div>
            <UrineTestForm
              reading={ newReading }
              onChange={ handleUrineTestChange }
              onSwitchChange={ handleUrineTestSwitchChange }
              hasUrineTest={ hasUrineTest }
            />
            <Form.Field control={ Button }>Submit</Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};
