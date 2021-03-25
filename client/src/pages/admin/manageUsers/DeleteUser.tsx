import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import React, { useState } from 'react';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';
import { Toast } from 'src/shared/components/toast';
import { apiFetch } from 'src/shared/utils/api';
import { IUser } from 'src/types';

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
      const url = BASE_URL + EndpointEnum.USER + String(deleteUser.userId);
      const resp = await apiFetch(url, {
        method: 'DELETE',
      });

      if (!resp.ok) {
        throw new Error();
      }

      setSubmitError(false);
      setSubmitSuccess(true);
      onClose();
    } catch (e) {
      setSubmitError(true);
    }
  };

  return (
    <>
      {submitSuccess && (
        <Toast
          status="success"
          message="User successfully deleted!"
          clearMessage={() => setSubmitSuccess(false)}
        />
      )}
      {submitError && (
        <Toast
          status="error"
          message="Something went wrong deleting that user. Please try again."
          clearMessage={() => setSubmitError(false)}
        />
      )}
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
