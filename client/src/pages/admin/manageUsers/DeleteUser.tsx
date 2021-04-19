import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import React, { useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { Toast } from 'src/shared/components/toast';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { IUser } from 'src/shared/types';

interface IProps {
  open: boolean;
  onClose: () => void;
  deleteUser: IUser | undefined;
}

const DeleteUser = ({ open, onClose, deleteUser }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const name = deleteUser?.firstName ?? '';

  const handleDelete = async () => {
    if (!deleteUser) {
      return;
    }

    try {
      const url = API_URL + EndpointEnum.USER + String(deleteUser.userId);
      await apiFetch(url, {
        method: 'DELETE',
      });

      setSubmitError(false);
      setSubmitSuccess(true);
      onClose();
    } catch (e) {
      setSubmitError(true);
    }
  };

  return (
    <>
      <Toast
        severity="success"
        message="User successfully deleted!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User: {name}</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Are you sure you want to delete {name}&apos;s account? This action
            is permanent and cannot be undone.
          </Alert>
          <br />
          <DialogActions>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteUser;
