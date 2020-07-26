import { Action, actionCreators } from '../reducers';
import { NewReading, Patient } from '@types';

import { Content } from './content';
import { Modal } from 'semantic-ui-react';
import React from 'react';
import { ReduxState } from '../../../../redux/rootReducer';
import { SymptomEnum } from '../../../../enums';
import { useSelector } from 'react-redux';

export interface IProps {
  displayReadingModal: boolean;
  hasUrineTest: boolean;
  newReading: NewReading;
  otherSymptoms: string;
  selectedPatient: Patient;
  selectedSymptoms: Record<SymptomEnum, boolean>;
  updateState: React.Dispatch<Action>;
}

export const ReadingModal: React.FC<IProps> = ({
  displayReadingModal,
  updateState,
  ...props
}) => {
  const readingCreated = useSelector(
    ({ patients }: ReduxState): boolean => patients.patientUpdated
  );

  const closeReadingModal = React.useCallback((): void => {
    updateState(actionCreators.toggleReadingModal());
  }, [updateState]);

  React.useEffect((): void => {
    if (readingCreated) {
      closeReadingModal();
    }
  }, [closeReadingModal, readingCreated]);

  return (
    <Modal closeIcon onClose={closeReadingModal} open={displayReadingModal}>
      <Modal.Header>Patient Information</Modal.Header>
      <Content {...props} updateState={updateState} />
    </Modal>
  );
};
