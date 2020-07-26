import {
  Button,
  CheckboxProps,
  Form as SemanticForm,
  TextAreaProps,
} from 'semantic-ui-react';
import { OrNull, UrineTests } from '@types';
import { useDispatch, useSelector } from 'react-redux';

import { Error } from '../../../../../../shared/components/error';
import { HeartForm } from './heart';
import { IProps } from '../..';
import { Paper } from '@material-ui/core';
import React from 'react';
import { ReduxState } from '../../../../../../redux/rootReducer';
import { SymptomEnum } from '../../../../../../enums';
import { SymptomForm } from '../../../../../../shared/components/form/symptom';
import { UrineTestForm } from '../../../../../../shared/components/form/urineTest';
import { actionCreators } from '../../../reducers';
import { clearCreateReadingOutcome } from '../../../../../../shared/reducers/reading';
import { useDisableSubmit } from './hooks/disableSubmit';
import { useStyles } from './styles';
import { useSubmit } from './hooks/submit';

type SelectorState = {
  readingError: OrNull<string>;
  loading: boolean;
};

export const Form: React.FC<Omit<IProps, 'displayReadingModal'>> = ({
  hasUrineTest,
  newReading,
  otherSymptoms,
  selectedPatient,
  selectedSymptoms,
  updateState,
}) => {
  const dispatch = useDispatch();

  const [error, setError] = React.useState<OrNull<string>>(null);

  const classes = useStyles();

  const { loading, readingError } = useSelector(
    ({ reading }: ReduxState): SelectorState => ({
      loading: reading.loading,
      readingError: reading.error ? reading.message : null,
    })
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

  const clearError = (): void => {
    if (error) {
      setError(null);
    }

    if (readingError) {
      dispatch(clearCreateReadingOutcome());
    }
  };

  const handleReadingSubmit = useSubmit({
    hasUrineTest,
    newReading,
    otherSymptoms,
    selectedSymptoms,
    selectedPatient,
    setError,
    updateState,
  });

  return (
    <>
      <Error error={error || readingError} clearError={clearError} />
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
    </>
  );
};
