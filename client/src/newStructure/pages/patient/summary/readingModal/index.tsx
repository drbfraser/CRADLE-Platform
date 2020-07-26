import { Action, actionCreators } from '../reducers';
import { NewReading, OrNull, Patient } from '@types';
import { useDispatch, useSelector } from 'react-redux';

import { Content } from './content';
import { Modal } from 'semantic-ui-react';
import React from 'react';
import { ReduxState } from '../../../../redux/rootReducer';
import { SymptomEnum } from '../../../../enums';
import { Toast } from '../../../../shared/components/toast';
import { clearCreateReadingOutcome } from '../../../../shared/reducers/reading';

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
  readingCreated: boolean;
};

export const ReadingModal: React.FC<IProps> = ({
  displayReadingModal,
  updateState,
  ...props
}) => {
  const { error, message, readingCreated } = useSelector(
    ({ patients, reading }: ReduxState): SelectorState => ({
      error: reading.error,
      readingCreated: patients.patientUpdated,
      message: reading.message,
    })
  );

  const dispatch = useDispatch();

  const closeReadingModal = React.useCallback((): void => {
    updateState(actionCreators.toggleReadingModal());
  }, [updateState]);

  React.useEffect((): void => {
    if (readingCreated) {
      closeReadingModal();
    }
  }, [closeReadingModal, readingCreated]);

  const clearMessage = (): void => {
    dispatch(clearCreateReadingOutcome());
  };

  return (
    <>
      <Toast
        clickaway={!error}
        message={message}
        status={error ? `error` : `success`}
        clearMessage={clearMessage}
      />
      <Modal closeIcon onClose={closeReadingModal} open={displayReadingModal}>
        <Modal.Header>Patient Information</Modal.Header>
        <Content {...props} updateState={updateState} />
      </Modal>
    </>
  );
};
