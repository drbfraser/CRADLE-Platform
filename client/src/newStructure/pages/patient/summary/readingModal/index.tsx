import { Action, actionCreators } from '../reducers';
import { NewReading, OrNull, Patient } from '@types';
import {
  clearCreateReadingOutcome,
  clearReadingCreatedResponse,
} from '../../../../redux/reducers/reading';
import { useDispatch, useSelector } from 'react-redux';

import { Content } from './content';
import { Modal } from 'semantic-ui-react';
import React from 'react';
import { ReduxState } from '../../../../redux/reducers';
import { SymptomEnum } from '../../../../enums';
import { Toast } from '../../../../shared/components/toast';

export interface IProps {
  displayReadingModal: boolean;
  hasUrineTest: boolean;
  newReading: NewReading;
  otherSymptoms: string;
  selectedPatient: Patient;
  selectedSymptoms: Record<SymptomEnum, boolean>;
  updateState: React.Dispatch<Action>;
}

type SelectorState = {
  error: boolean;
  message: OrNull<string>;
};

export const ReadingModal: React.FC<IProps> = ({
  displayReadingModal,
  updateState,
  ...props
}) => {
  const [submissionError, setSubmissionError] = React.useState<OrNull<string>>(
    null
  );

  const { error, message } = useSelector(
    ({ reading }: ReduxState): SelectorState => ({
      error: reading.error,
      message: reading.message,
    })
  );

  const dispatch = useDispatch();

  const closeReadingModal = React.useCallback((): void => {
    updateState(actionCreators.closeReadingModal());
    updateState(actionCreators.reset());
  }, [updateState]);

  const clearMessage = (): void => {
    setSubmissionError(null);
    dispatch(clearCreateReadingOutcome());
  };

  React.useEffect((): void => {
    if (!error && message) {
      updateState(actionCreators.reset());
      dispatch(clearReadingCreatedResponse());
    }
  }, [dispatch, error, message, updateState]);

  return (
    <>
      <Toast
        clickaway={!error}
        message={message || submissionError}
        status={error || submissionError ? `error` : `success`}
        clearMessage={clearMessage}
      />
      <Modal closeIcon onClose={closeReadingModal} open={displayReadingModal}>
        <Modal.Header>Patient Information</Modal.Header>
        <Content
          {...props}
          displayReadingModal={displayReadingModal}
          setError={setSubmissionError}
          updateState={updateState}
        />
      </Modal>
    </>
  );
};
