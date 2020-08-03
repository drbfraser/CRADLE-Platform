import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import { useStyles } from './styles';

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
  const classes = useStyles();

  return (
    <Dialog
      open={displayDeleteUserModal}
      onClose={closeDeleteUserModal}
      aria-labelledby="delete-user-dialog-title"
      aria-describedby="delete-user-dialog-description">
      <DialogTitle id="delete-user-dialog-title">Delete User</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-user-dialog-question">
          Are you sure you want to delete this user?
        </DialogContentText>
        <DialogContentText id="delete-user-dialog-firstName">
          First Name: {firstName}
        </DialogContentText>
        <DialogContentText id="delete-user-dialog-email">
          Email: {email}
        </DialogContentText>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={closeDeleteUserModal} color="default">
          Cancel
        </Button>
        <Button onClick={handleDelete} color="primary" variant="outlined">
          Yes I&apos;m sure
        </Button>
      </DialogActions>
    </Dialog>
  );
};
