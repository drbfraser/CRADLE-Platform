import { Action, actionCreators } from '../reducers';
import { NewReading, Patient } from '@types';

import { Content } from './content';
import { Modal } from 'semantic-ui-react';
import React from 'react';
import { SymptomEnum } from '../../../../enums';

export interface IProps {
  displayReadingModal: boolean;
  hasUrineTest: boolean;
  newReading: NewReading;
  otherSymptoms: string;
  selectedPatient: Patient;
  selectedSymptoms: Record<SymptomEnum, boolean>;
  symptoms: string;
  updateState: React.Dispatch<Action>;
}

export const ReadingModal: React.FC<IProps> = ({
  displayReadingModal,
  updateState,
  ...props
}) => {
  const closeReadingModal = (): void => {
    updateState(actionCreators.toggleReadingModal());
  };

  return (
    <Modal closeIcon onClose={closeReadingModal} open={displayReadingModal}>
      <Modal.Header>Patient Information</Modal.Header>
      <Content {...props} updateState={updateState} />
    </Modal>
  );
};
