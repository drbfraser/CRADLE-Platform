import { CancelButton, PrimaryButton } from '../Button';

import Alert from '@material-ui/lab/Alert';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';

interface IProps {
  title: string;
  content: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog = ({
  title,
  content,
  open,
  onClose,
  onConfirm,
}: IProps) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="confirm-dialog">
      <DialogTitle id="confirm-dialog" data-testid="confirm-dialog">
        {title}
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" data-testid="warningAlert">
          {content}
        </Alert>
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={onClose}>No</CancelButton>
        <PrimaryButton onClick={onConfirm}>Yes</PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};
