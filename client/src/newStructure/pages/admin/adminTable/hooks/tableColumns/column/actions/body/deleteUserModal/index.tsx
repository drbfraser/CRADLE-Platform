import { Button, Header, Modal } from 'semantic-ui-react';

import React from 'react';
import { User } from '@types';

interface IProps {
  displayDeleteUserModal: boolean;
  selectedUser: User;
  closeDeleteUserModal: () => void;
  handleSubmit: () => void;
}

export const DeleteUserModal: React.FC<IProps> = ({
  displayDeleteUserModal,
  selectedUser,
  closeDeleteUserModal,
  handleSubmit,
}) => {
  return (
    <Modal
      basic
      size="small"
      closeIcon
      onClose={closeDeleteUserModal}
      open={displayDeleteUserModal}>
      <Header icon="archive" content="Confirm Deleting User" />
      <Modal.Content>
        <p>Are you sure you want to delete the User:</p>
        <p>First Name: {selectedUser.firstName}</p>
        <p>Email: {selectedUser.email}</p>
      </Modal.Content>
      <Modal.Actions>
        <Button
          basic={true}
          color="red"
          inverted
          onClick={closeDeleteUserModal}>
          No
        </Button>
        <Button color="green" inverted onClick={handleSubmit}>
          Yes
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
