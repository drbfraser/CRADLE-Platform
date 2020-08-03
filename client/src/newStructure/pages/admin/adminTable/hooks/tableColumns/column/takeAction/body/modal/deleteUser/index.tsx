import { Dialog } from '../../../../../../../../../../shared/components/dialog';
import DialogContentText from '@material-ui/core/DialogContentText';
import React from 'react';

interface IProps {
  displayDeleteUserModal: boolean;
  email: string;
  firstName: string;
  closeDeleteUserModal: () => void;
  handleDelete: () => void;
}

export const DeleteUserModal: React.FC<IProps> = ({
  displayDeleteUserModal,
  email,
  firstName,
  closeDeleteUserModal,
  handleDelete,
}) => {
  return (
    <Dialog
      open={displayDeleteUserModal}
      onClose={closeDeleteUserModal}
      aria-labelledby="delete-user-dialog-title"
      content={
        <>
          <DialogContentText>First Name: {firstName}</DialogContentText>
          <DialogContentText>Email: {email}</DialogContentText>
        </>
      }
      title="Delete User"
      subtitle="Are you sure you want to delete this user?"
      primaryAction={{
        buttonText: `Yes I'm Sure`,
        onClick: handleDelete,
      }}
      secondaryAction={{
        buttonText: `Cancel`,
        onClick: closeDeleteUserModal,
      }}
    />
  );
};
