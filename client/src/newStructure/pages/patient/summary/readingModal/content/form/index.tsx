import {
  Button,
  CheckboxProps,
  Form as SemanticForm,
  TextAreaProps,
} from 'semantic-ui-react';

import { HeartForm } from './heart';
import { IProps } from '..';
import { Paper } from '@material-ui/core';
import React from 'react';
import { ReduxState } from '../../../../../../redux/rootReducer';
import { SymptomEnum } from '../../../../../../enums';
import { SymptomForm } from '../../../../../../shared/components/form/symptom';
import { UrineTestForm } from '../../../../../../shared/components/form/urineTest';
import { UrineTests } from '@types';
import { actionCreators } from '../../../reducers';
import { useDisableSubmit } from './hooks/disableSubmit';
import { useSelector } from 'react-redux';
import { useStyles } from './styles';
import { useSubmit } from './hooks/submit';

export const Form: React.FC<IProps> = ({
  displayReadingModal,
  hasUrineTest,
  newReading,
  otherSymptoms,
  selectedPatient,
  selectedSymptoms,
  setError,
  updateState,
}) => {
  const classes = useStyles();

  const loading = useSelector(
    ({ reading }: ReduxState): boolean => reading.loading
  );

  const disabled = useDisableSubmit({
    hasUrineTest,
    loading,
    newReading,
  });

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

  const handleReadingSubmit = useSubmit({
    displayReadingModal,
    hasUrineTest,
    newReading,
    otherSymptoms,
    selectedSymptoms,
    selectedPatient,
    setError,
  });

  return (
    <SemanticForm onSubmit={handleReadingSubmit}>
      <Paper className={classes.formContainer}>
        <HeartForm newReading={newReading} updateState={updateState} />
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
        newReading={newReading}
        onChange={handleUrineTestChange}
        onSwitchChange={handleUrineTestSwitchChange}
        hasUrineTest={hasUrineTest}
      />
      <SemanticForm.Field control={Button} disabled={disabled}>
        Submit
      </SemanticForm.Field>
    </SemanticForm>
  );
};
