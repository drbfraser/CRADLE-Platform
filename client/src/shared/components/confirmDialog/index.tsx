import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Alert from '@material-ui/lab/Alert';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { PrimaryButton } from '../Button';

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
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>
        <Alert severity="warning">{content}</Alert>
      </DialogContent>
      <DialogActions>
        <PrimaryButton onClick={onClose} color="primary">
          No
        </PrimaryButton>
        <PrimaryButton onClick={onConfirm} color="default">
          Yes
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};
