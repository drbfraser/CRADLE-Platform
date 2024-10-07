import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { IRelayNum } from 'src/shared/types';
import { Toast } from 'src/shared/components/toast';
import { deleteRelayNumAsync } from 'src/shared/api';
import { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';

interface IProps {
  open: boolean;
  onClose: () => void;
  deleteRelayNum?: IRelayNum;
}

const DeleteRelayNum = ({ open, onClose, deleteRelayNum }: IProps) => {
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleDelete = async () => {
    if (!deleteRelayNum) {
      return;
    }

    try {
      await deleteRelayNumAsync(deleteRelayNum);
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
        message="Number Successfully Deleted!"
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
      />
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Delete Relay Number</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this form template?</p>
        </DialogContent>
        <DialogActions
          sx={(theme) => ({
            padding: theme.spacing(2),
          })}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <PrimaryButton onClick={handleDelete}>Delete</PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteRelayNum;
