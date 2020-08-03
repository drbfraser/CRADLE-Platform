import DialogContentText from '@material-ui/core/DialogContentText';
import { DialogPopup } from '../../../../../../../../../../shared/components/dialogPopup';
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
    <DialogPopup
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
        children: `Yes I'm Sure`,
        onClick: handleDelete,
      }}
      secondaryAction={{
        children: `Cancel`,
        onClick: closeDeleteUserModal,
      }}
    />
  );
};
