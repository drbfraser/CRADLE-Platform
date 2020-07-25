import {
  Button,
  CheckboxProps,
  Input,
  InputOnChangeData,
  Form as SemanticForm,
  TextAreaProps,
} from 'semantic-ui-react';
import { OrUndefined, UrineTests } from '@types';
import { useDispatch, useSelector } from 'react-redux';

import { IProps } from '../..';
import { Paper } from '@material-ui/core';
import React from 'react';
import { ReduxState } from '../../../../../../redux/rootReducer';
import { SymptomEnum } from '../../../../../../enums';
import { SymptomForm } from '../../../../../../shared/components/form/symptom';
import { UrineTestForm } from '../../../../../../shared/components/form/urineTest';
import { actionCreators } from '../../../reducers';
import { v4 as makeUniqueId } from 'uuid';
import { newReadingPost } from '../../../../../../shared/reducers/newReadingPost';
import { useStyles } from './styles';

export const Form: React.FC<Omit<IProps, 'displayReadingModal'>> = ({
  hasUrineTest,
  newReading,
  otherSymptoms,
  selectedPatient,
  selectedSymptoms,
  symptoms,
  updateState,
}) => {
  const classes = useStyles();

  const userId = useSelector(
    ({ user }: ReduxState): OrUndefined<number> => user.current.data?.userId
  );

  const dispatch = useDispatch();

  const handleSelectedSymptomsChange = (
    _: React.FormEvent<HTMLInputElement>,
    { value }: CheckboxProps
  ): void => {
    updateState(actionCreators.updateSymptoms(value as SymptomEnum));
  };

  const handleOtherSymptomsChange = (
    _: React.FormEvent<HTMLTextAreaElement>,
    { value }: TextAreaProps
  ): void => {
    updateState(actionCreators.updateOtherSymptoms(value as string));
  };

  const handleUrineTestChange = (
    _: any,
    data: { name: keyof UrineTests; value: string }
  ): void => {
    updateState(
      actionCreators.updateUrineTest({ key: data.name, value: data.value })
    );
  };

  const handleUrineTestSwitchChange = (): void => {
    updateState(actionCreators.toggleUrineTest());
  };

  const handleReadingChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { name, value }: InputOnChangeData
  ): void => {
    updateState(actionCreators.updateNewReading({ key: name, value }));
  };

  const handleReadingSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    if (!userId) {
      // TODO: Show error message toast
    }

    // * Generate random id as reading id
    const readingId = makeUniqueId();

    // * Generate reading date as current time
    const dateTimeTaken = Math.floor(Date.now() / 1000);

    // * Remove unnecessary fields
    /*const {
      readings,
      needsAssessment,
      tableData,
      ...patientData
    } = selectedPatient;*/

    const { urineTests, ...readingData } = newReading;

    dispatch(
      newReadingPost({
        patient: { ...selectedPatient },
        reading: {
          ...readingData,
          userId,
          readingId,
          dateTimeTaken,
          symptoms,
          dateRecheckVitalsNeeded: null,
          urineTests: hasUrineTest ? urineTests : null,
        },
      })
    );

    // TODO: Upon failed new reading addition
    // TODO: Display error message

    // TODO: Upon successsful new reading addition
    // TODO: Display success message
    // TODO: Calculate traffic light for new reading (Use calculate shock index in utils)
    // TODO: Update traffic light for new reading
    // TODO: Update patient with new reading
  };

  return (
    <SemanticForm onSubmit={handleReadingSubmit}>
      <Paper className={classes.formContainer}>
        <SemanticForm.Group widths="equal">
          <SemanticForm.Field
            name="bpSystolic"
            value={newReading.bpSystolic}
            control={Input}
            label="Systolic"
            type="number"
            min="10"
            max="300"
            onChange={handleReadingChange}
            required
          />
          <SemanticForm.Field
            name="bpDiastolic"
            value={newReading.bpDiastolic}
            control={Input}
            label="Diastolic"
            type="number"
            min="10"
            max="300"
            onChange={handleReadingChange}
            required
          />
          <SemanticForm.Field
            name="heartRateBPM"
            value={newReading.heartRateBPM}
            control={Input}
            label="Heart rate"
            type="number"
            min="30"
            max="300"
            onChange={handleReadingChange}
            required
          />
        </SemanticForm.Group>
      </Paper>
      <div className={classes.symptomFormContainer}>
        <SymptomForm
          selectedSymptoms={selectedSymptoms}
          otherSymptoms={otherSymptoms}
          onSelectedSymptomsChange={handleSelectedSymptomsChange}
          onOtherSymptomsChange={handleOtherSymptomsChange}
        />
      </div>
      <UrineTestForm
        reading={newReading}
        onChange={handleUrineTestChange}
        onSwitchChange={handleUrineTestSwitchChange}
        hasUrineTest={hasUrineTest}
      />
      <SemanticForm.Field control={Button}>Submit</SemanticForm.Field>
    </SemanticForm>
  );
};
