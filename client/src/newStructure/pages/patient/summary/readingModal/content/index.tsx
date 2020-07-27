import { Callback, OrNull } from '@types';
import { Header, Modal } from 'semantic-ui-react';

import { Form } from './form';
import { IProps as Props } from '..';
import React from 'react';

export interface IProps extends Props {
  setError: Callback<OrNull<string>>;
}

export const Content: React.FC<IProps> = ({ selectedPatient, ...props }) => {
  return (
    <Modal.Content scrolling>
      <Modal.Description>
        <Header>New Patient Reading for ID #{selectedPatient.patientId}</Header>
      </Modal.Description>
      <Form {...props} selectedPatient={selectedPatient} />
    </Modal.Content>
  );
};
