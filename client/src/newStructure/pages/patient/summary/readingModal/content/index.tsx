import { Header, Modal } from 'semantic-ui-react';

import { Form } from './form';
import { IProps } from '..';
import React from 'react';

export const Content: React.FC<Omit<IProps, 'displayReadingModal'>> = ({
  selectedPatient,
  ...props
}) => {
  return (
    <Modal.Content scrolling>
      <Modal.Description>
        <Header>New Patient Reading for ID #{selectedPatient.patientId}</Header>
      </Modal.Description>
      <Form {...props} selectedPatient={selectedPatient} />
    </Modal.Content>
  );
};
